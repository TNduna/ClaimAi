// background.js
// Load the database engine as a classic script so we can avoid module bundling
importScripts('./lib/db.js');

console.log('%cClaimAi Background Service Worker Loaded ✅', 'color: #10b981; font-weight: bold');

const db = new ClaimAiDB();

// Ensure context menu exists at service worker startup (covers reloads/upgrades)
try {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'claimai-lookup',
      title: 'Lookup in ClaimAi',
      contexts: ['selection']
    }, () => {
      if (chrome.runtime.lastError) {
        console.warn('ClaimAi: contextMenus.create error on startup', chrome.runtime.lastError.message);
      } else {
        console.log('ClaimAi: Context menu ensured at startup');
      }
    });
  });
} catch (e) {
  console.warn('ClaimAi: Failed to ensure context menu at startup', e);
}

/**
 * Attempts to delete legacy DB V1 in a fire-and-forget manner so it cannot block startup.
 */
function safeDeleteLegacyDatabase(dbName) {
  try {
    const deleteRequest = indexedDB.deleteDatabase(dbName);

    deleteRequest.onsuccess = () => {
      console.log(`ClaimAi: Legacy database '${dbName}' removed successfully.`);
    };

    deleteRequest.onblocked = () => {
      console.warn(`ClaimAi: Legacy database deletion blocked. Active connections exist.`);
    };

    deleteRequest.onerror = (e) => {
      console.warn(`ClaimAi: Non-critical error deleting legacy database:`, e);
    };
  } catch (e) {
    console.warn('ClaimAi: Safe database deletion wrapper error:', e);
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('ClaimAi: Initialization sequence started.');
  // Fire-and-forget cleanup of legacy V1 DB (do not await)
  safeDeleteLegacyDatabase('ClaimAiDatabase');
    try {
        await db.init();

        const currentCount = await db.countRecords();
        console.log(`Current IndexedDB record count: ${currentCount}`);

        if (currentCount === 0) {
            console.log('Database is empty. Initiating high-speed seeding...');

            const response = await fetch(chrome.runtime.getURL('lib/icd10-index.json'));
            if (!response.ok) {
                throw new Error(`Failed to load lib/icd10-index.json: Status ${response.status}`);
            }

            const rawData = await response.json();
            const icdArray = Object.keys(rawData)
                .filter(key => key && rawData[key])
                .map(key => ({
                    code: key.trim().toUpperCase(),
                    displayCode: rawData[key].code || key,
                    description: rawData[key].description || 'No description provided.',
                    pmbCode: rawData[key].pmbCode || null
                }));

            console.log(`Prepared ${icdArray.length} valid records. Executing database write transaction...`);

            const startTime = performance.now();
            await db.bulkInsertAll(icdArray);
            const endTime = performance.now();

            console.log(`ClaimAi: Database seeded successfully in ${((endTime - startTime) / 1000).toFixed(2)}s.`);
        } else {
            console.log('Database already initialized and populated.');
        }
        // Ensure context menu is created for text selection lookups
        try {
          chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
              id: 'claimai-lookup',
              title: 'Lookup in ClaimAi',
              contexts: ['selection']
            });
            console.log('ClaimAi: Context menu created');
          });
        } catch (cmErr) {
          console.warn('ClaimAi: Failed to create context menu', cmErr);
        }
    } catch (err) {
        const errorDetails = {
            message: err.message || err.toString(),
            name: err.name || 'UnknownError',
            stack: err.stack || 'No stack trace available'
        };

        console.error('Error initializing DB on install:', errorDetails.message, {
            errorType: errorDetails.name,
            stackTrace: errorDetails.stack,
            dbInitialized: !!db.db
        });
    }
});

// Handle right-click menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "claimai-lookup" && info.selectionText) {
    const selectedText = info.selectionText.trim();
    console.log('ClaimAi context lookup clicked:', selectedText);

    chrome.sidePanel.open({ tabId: tab.id });

    // Give side panel time to open
    setTimeout(() => {
      console.log('ClaimAi sending lookup message to side panel:', selectedText);
      chrome.runtime.sendMessage({
        action: "lookup",
        code: selectedText
      }, () => {
        if (chrome.runtime.lastError) {
          console.warn('ClaimAi lookup message failed:', chrome.runtime.lastError.message);
        } else {
          console.log('ClaimAi lookup message delivered');
        }
      });
    }, 400);
  }
});

// Live-mode map: tabId -> boolean
const liveMode = {};

// Listen for messages from side panel or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getICDData") {
    // Optional: send data directly if needed
  }

  // Allow sidepanel to set live mode for a specific tab
  if (message.action === 'SET_LIVE_MODE') {
    const tabId = message.tabId;
    const enabled = !!message.enabled;
    if (typeof tabId === 'number' && tabId > 0) {
      liveMode[tabId] = enabled;
      console.log(`ClaimAi: Live mode for tab ${tabId} set to ${enabled}`);
      sendResponse({ ok: true });
      return true;
    }
    sendResponse({ ok: false, reason: 'NO_TAB_ID' });
    return false;
  }

  // Centralized query proxy for UI (popup/sidepanel)
  if (message.action === 'VALIDATE_CODES') {
    const senderInfo = sender || {};
    validateCodesArray(message.codes, senderInfo)
      .then(results => sendResponse({ results }))
      .catch(err => {
        console.error('Batch validation error:', err);
        sendResponse({ results: [] });
      });
    return true;
  }

  if (message.action === 'QUERY_CODE' || message.action === 'QUICK_LOOKUP') {
    const code = (message.code || '').toString();
    queryIcd10Index(code)
      .then(data => sendResponse({ data }))
      .catch(error => {
        console.error('Query error:', error);
        sendResponse({ data: null, error: error.message });
      });
    return true; // indicates async sendResponse
  }
});

/**
  * Validates a list of extracted codes against the internal database
  */
async function validateCodesArray(codes, senderInfo = {}) {
  const results = [];
  const dbInstance = db;

  for (const rawCode of codes) {
    const normalized = (rawCode || '').toUpperCase().replace(/\./g, '').replace(/\s+/g, '');
    try {
      const record = await dbInstance.getCode(normalized);
      if (record) {
        results.push({
          raw: rawCode,
          normalized,
          isValid: true,
          description: record.description || record.d || record.icdDescription || '',
          pmbEligible: !!record.pmbCode
        });
      } else {
        results.push({ raw: rawCode, normalized, isValid: false, pmbEligible: false });
      }
    } catch (e) {
      console.error('Validation lookup error for', rawCode, e);
      results.push({ raw: rawCode, normalized, isValid: false, pmbEligible: false });
    }
  }

  // If live mode enabled for originating tab, forward a lightweight update to UI (sidepanel)
  try {
    const originatingTabId = senderInfo.tab && senderInfo.tab.id;
    if (typeof originatingTabId === 'number' && liveMode[originatingTabId]) {
      const first = results && results.length ? results[0] : null;
      const codeToSend = first ? first.normalized : (codes && codes.length ? codes[0] : null);
      chrome.runtime.sendMessage({ action: 'liveUpdate', code: codeToSend, results }, (resp) => {
        if (chrome.runtime.lastError) {
          // non-critical
        }
      });
    }
  } catch (e) {
    // swallow
  }

  return results;
}

/**
  * Query ICD-10 via IndexedDB if available, fallback to JSON fetch
  */
async function queryIcd10Index(targetCode) {
  const normalized = (targetCode || '').toUpperCase().replace(/\./g, '').replace(/\s+/g, '');
  try {
    const rec = await db.getCode(normalized);
    if (rec) {
      return rec;
    }
    // fallback: fetch JSON
    const response = await fetch(chrome.runtime.getURL('lib/icd10-index.json'));
    if (!response.ok) throw new Error('Failed to load ICD-10 index');
    const index = await response.json();
    return index[normalized] || null;
  } catch (err) {
    throw err;
  }
}

