// background.js
// Load the database engine as a classic script so we can avoid module bundling
importScripts('./lib/db.js');

if (typeof chrome !== 'undefined' && chrome.runtime) {
  console.log('%cClaimAi Background Service Worker Loaded ✅', 'color: #10b981; font-weight: bold');

  const db = new ClaimAiDB();

  // In-memory PMB lookup — keyed by both dotted and undotted forms
  let pmbMap = null;

  /**
   * Loads PMB linkages into pmbMap once and caches it.
   * Keys are normalised to both dotted ("E11.5") and undotted ("E115") forms.
   */
  async function ensurePmbMap() {
    if (pmbMap) return pmbMap;
    try {
      const resp = await fetch(chrome.runtime.getURL('rules/pmb-linkages.json'));
      if (!resp.ok) throw new Error(`PMB fetch failed: ${resp.status}`);
      const raw = await resp.json();
      pmbMap = {};
      for (const rawKey of Object.keys(raw)) {
        // Strip dagger/asterisk paired suffixes like "+H36.0*"
        const baseKey = rawKey.split('+')[0].trim().toUpperCase();
        if (!baseKey || baseKey.includes(' ')) continue; // skip header rows
        const undotted = baseKey.replace(/\./g, '');
        const dotted = baseKey;
        const entry = raw[rawKey];
        if (!pmbMap[dotted]) pmbMap[dotted] = entry;
        if (!pmbMap[undotted]) pmbMap[undotted] = entry;
      }
      console.log(`ClaimAi: PMB map loaded (${Object.keys(pmbMap).length} entries)`);
    } catch (e) {
      console.warn('ClaimAi: PMB map load failed, PMB eligibility will be unavailable.', e);
      pmbMap = {};
    }
    return pmbMap;
  }

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

  // Live-mode setting: default to true
  let liveModeEnabled = true;
  chrome.storage.local.get(['liveModeEnabled'], (result) => {
    if (result.liveModeEnabled !== undefined) {
      liveModeEnabled = !!result.liveModeEnabled;
    }
  });

  // Listen for storage changes to keep in sync
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.liveModeEnabled) {
      liveModeEnabled = !!changes.liveModeEnabled.newValue;
      console.log(`ClaimAi: Live mode state updated to ${liveModeEnabled}`);
    }
  });

  // Listen for messages from side panel or content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getICDData") {
      // Optional: send data directly if needed
    }

    // Allow sidepanel to set live mode
    if (message.action === 'SET_LIVE_MODE') {
      liveModeEnabled = !!message.enabled;
      chrome.storage.local.set({ liveModeEnabled });
      console.log(`ClaimAi: Live mode set to ${liveModeEnabled}`);
      sendResponse({ ok: true });
      return true;
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
   * Returns candidate lookup keys for a raw user-typed code.
   * The ICD-10-CM dataset uses 5-7 character codes (e.g. E11.51, E11.3211).
   * When a user types a shorter form like "E11.5", we also try prefix matching
   * against the next expected sub-code (e.g. E11.50, E11.51 … E11.59).
   */
  function buildLookupVariants(rawCode) {
    let upper = (rawCode || '').toUpperCase().trim();
    if (upper.startsWith('0')) {
      upper = 'O' + upper.slice(1);
    }
    const undotted = upper.replace(/\./g, '');
    const variants = new Set();

    // 1. Exact dotted form as typed (e.g. "E11.5")
    variants.add(upper);
    // 2. Exact undotted form (e.g. "E115")
    variants.add(undotted);

    // 3. Sub-code prefix expansion: if the typed code has a decimal part that is
    //    shorter than what the dataset stores, try appending 0-9.
    //    e.g. "E11.5" → try "E11.50" … "E11.59" (and their undotted equivalents)
    const dotIdx = upper.indexOf('.');
    if (dotIdx !== -1) {
      const decPart = upper.slice(dotIdx + 1);
      // Dataset decimal parts are 2-4 digits; expand only if user typed 1-3 digits
      if (decPart.length >= 1 && decPart.length <= 3) {
        for (let d = 0; d <= 9; d++) {
          const expanded = `${upper}${d}`;
          variants.add(expanded);
          variants.add(expanded.replace(/\./g, ''));
        }
      }
    } else {
      // No dot typed — also try adding a dot after the 3rd char and expanding
      // e.g. "E115" → try "E11.50" … "E11.59"
      if (undotted.length === 4) {
        const base = `${undotted.slice(0, 3)}.${undotted.slice(3)}`;
        for (let d = 0; d <= 9; d++) {
          const expanded = `${base}${d}`;
          variants.add(expanded);
          variants.add(expanded.replace(/\./g, ''));
        }
      }
    }

    return Array.from(variants);
  }

  /**
    * Validates a list of extracted codes against the internal database.
    * Includes robust prefix-based fallback and correct PMB eligibility check.
    */
  async function validateCodesArray(codes, senderInfo = {}) {
    const results = [];
    const dbInstance = db;
    const pmb = await ensurePmbMap();

    for (const rawCode of codes) {
      try {
        const variants = buildLookupVariants(rawCode);
        let record = null;
        let matchedKey = null;

        for (const variant of variants) {
          record = await dbInstance.getCode(variant);
          if (record) { matchedKey = variant; break; }
        }

        // Determine the best display code: prefer dotted form from matched key
        const displayRaw = (() => {
          if (!matchedKey) return rawCode;
          // If matched key is dotted use it; otherwise reconstruct dotted form
          if (matchedKey.includes('.')) return matchedKey;
          const u = matchedKey;
          return u.length > 3 ? `${u.slice(0, 3)}.${u.slice(3)}` : u;
        })();

        // PMB check: look up all variants in the PMB map
        const pmbEntry = variants.reduce((found, v) => found || pmb[v] || null, null);
        const pmbEligible = !!pmbEntry;

        if (record) {
          results.push({
            raw: displayRaw,
            normalized: matchedKey,
            isValid: true,
            description: record.description || record.d || record.icdDescription || '',
            pmbEligible,
            pmbCode: pmbEntry && pmbEntry.pmbCode ? pmbEntry.pmbCode : null
          });
        } else {
          results.push({ raw: rawCode, normalized: rawCode.toUpperCase().replace(/\./g,''), isValid: false, pmbEligible: false });
        }
      } catch (e) {
        console.error('Validation lookup error for', rawCode, e);
        results.push({ raw: rawCode, normalized: rawCode.toUpperCase().replace(/\./g,''), isValid: false, pmbEligible: false });
      }
    }

    // If live mode enabled, forward a lightweight update to UI (sidepanel)
    try {
      if (liveModeEnabled) {
        const first = results && results.length ? results[0] : null;
        const codeToSend = first ? (first.normalized || first.raw) : (codes && codes.length ? codes[0] : null);
        chrome.runtime.sendMessage({ action: 'liveUpdate', code: codeToSend, results }, () => {
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
    try {
      const variants = buildLookupVariants(targetCode);
      for (const variant of variants) {
        const rec = await db.getCode(variant);
        if (rec) return rec;
      }
      // fallback: fetch JSON and try all variants
      const response = await fetch(chrome.runtime.getURL('lib/icd10-index.json'));
      if (!response.ok) throw new Error('Failed to load ICD-10 index');
      const index = await response.json();
      for (const variant of variants) {
        if (index[variant]) return index[variant];
      }
      return null;
    } catch (err) {
      throw err;
    }
  }
} else {
  console.warn('ClaimAi: Chrome extension runtime environment not detected.');
}

