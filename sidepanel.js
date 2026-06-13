// sidepanel.js
let icd10Index = {};
let pmbIndex = {};
let daggerAsteriskIndex = {};
let ageGenderRules = {};
let externalCauseRules = {};
let dbInstance = null;

let patientAge = null;
let patientGender = null;
let dataLoaded = false;
let pendingLookup = null;

async function loadData() {
  try {
    // Load JS index and rules into memory (no direct DB initialization from sidepanel)
    try {
      const mod = await import(chrome.runtime.getURL('lib/icd10-index.js'));
      icd10Index = mod.icd10Index || mod.default || mod || {};
    } catch (err) {
      // fallback to JSON if needed
      try {
        const resp = await fetch(chrome.runtime.getURL('lib/icd10-index.json'));
        if (resp.ok) icd10Index = await resp.json();
      } catch (e) {
        console.warn('Failed to load icd10 index for sidepanel:', e);
      }
    }

    const pmbRes2 = await fetch(chrome.runtime.getURL('rules/pmb-linkages.json'));
    pmbIndex = normalizeSourceIndex(await pmbRes2.json());
    const daRes2 = await fetch(chrome.runtime.getURL('rules/dagger-asterisk-pairs.json'));
    daggerAsteriskIndex = normalizeSourceIndex(await daRes2.json());
    const agRes2 = await fetch(chrome.runtime.getURL('rules/age-gender-rules.json'));
    ageGenderRules = await agRes2.json();
    const ecRes2 = await fetch(chrome.runtime.getURL('rules/external-cause-rules.json'));
    externalCauseRules = await ecRes2.json();

    console.log(`Loaded ICD index (${Object.keys(icd10Index).length} codes) into memory`);
    dataLoaded = true;
    if (pendingLookup) {
      showResult(pendingLookup);
      pendingLookup = null;
    }
  } catch (e) {
    console.error('Data load error:', e);
  }
}

function normalizeCode(code) {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

function getCodeVariants(code) {
  const clean = normalizeCode(code);
  const variants = new Set([clean]);
  if (clean.includes('.')) {
    variants.add(clean.replace(/\./g, ''));
  } else if (clean.length > 3) {
    variants.add(`${clean.slice(0, 3)}.${clean.slice(3)}`);
  }
  return Array.from(variants);
}

function lookupIndex(index, code) {
  for (const variant of getCodeVariants(code)) {
    if (index[variant]) return index[variant];
  }
  return null;
}

function normalizeSourceIndex(rawIndex) {
  const normalized = {};
  for (const rawKey of Object.keys(rawIndex)) {
    const baseKey = normalizeCode(rawKey.split('+')[0]);
    const variants = getCodeVariants(baseKey);
    for (const variant of variants) {
      if (!normalized[variant]) {
        normalized[variant] = rawIndex[rawKey];
      }
    }
  }
  return normalized;
}

function checkAgeGender(code) {
  let cleanCode = normalizeCode(code);
  const rule = ageGenderRules[cleanCode.substring(0, 3)] || ageGenderRules[cleanCode];
  if (!rule) return null;

  const warnings = [];
  if (rule.ageMax && patientAge !== null && patientAge > rule.ageMax) {
    warnings.push(`Code typically for patients under ${rule.ageMax} years.`);
  }
  if (rule.gender && patientGender && rule.gender !== patientGender) {
    warnings.push(`Code restricted to ${rule.gender === 'M' ? 'Male' : 'Female'} patients.`);
  }
  return warnings.length > 0 ? { warnings } : null;
}

function checkExternalCause(code) {
  let cleanCode = normalizeCode(code);
  if (!cleanCode.startsWith('S') && !cleanCode.startsWith('T')) return null;

  const num = parseInt(cleanCode.substring(1, 3)) || 0;
  if (num >= 0 && num <= 9) return externalCauseRules["S00-S09"];
  if (num >= 10 && num <= 19) return externalCauseRules["S10-S19"];
  if (num >= 40 && num <= 49) return externalCauseRules["S40-S49"];
  if (num >= 50 && num <= 59) return externalCauseRules["S50-S59"];
  if (num >= 70 && num <= 79) return externalCauseRules["S70-S79"];
  if (num >= 80 && num <= 89) return externalCauseRules["S80-S89"];
  if (num >= 90 && num <= 99) return externalCauseRules["S90-S99"];
  return externalCauseRules["T"];
}

async function showResult(code) {
  const resultDiv = document.getElementById('result');
  let cleanCode = normalizeCode(code);

  let icdData = null;
  let pmbData = null;
  if (dbInstance) {
    for (const variant of getCodeVariants(cleanCode)) {
      if (!icdData) icdData = await dbInstance.getICD(variant);
      if (!pmbData) pmbData = pmbIndex[variant] || await dbInstance.getPMB(variant);
      if (icdData && pmbData) break;
    }
  } else {
    icdData = lookupIndex(icd10Index, cleanCode);
    pmbData = lookupIndex(pmbIndex, cleanCode);
  }
  const daData = lookupIndex(daggerAsteriskIndex, cleanCode + '*') || lookupIndex(daggerAsteriskIndex, cleanCode);
  const agCheck = checkAgeGender(cleanCode);
  const ecCheck = checkExternalCause(cleanCode);

  let html = `<div class="card">`;
  const description = icdData?.d || pmbData?.pmbDescription || pmbData?.icdDescription || 'No description available.';

  if (icdData || pmbData) {
    html += `<div class="code">${cleanCode}</div>`;
    html += `<p class="text-zinc-200">${description}</p>`;
    html += `<div class="mt-3 text-emerald-400 text-sm">✓ VALID ICD-10 Code${pmbData ? ' · PMB eligible' : ''}</div>`;
  } else {
    html += `<div class="code text-amber-400">${cleanCode}</div><p class="text-amber-300">Code not found.</p>`;
  }

  if (pmbData) {
    html += `
      <div class="pmb-box mt-4">
        <div class="flex items-center gap-2 text-emerald-400 mb-2 font-medium">🛡️ PMB-ELIGIBLE CONDITION</div>
        <div class="text-sm">${pmbData.pmbDescription || pmbData.icdDescription}</div>
      </div>`;
  }

  if (agCheck) {
    html += `
      <div class="mt-4 p-4 bg-red-950 border border-red-600 rounded-2xl">
        <div class="flex items-center gap-2 text-red-400 mb-3 font-semibold">⚠️ DEMOGRAPHIC MISMATCH</div>
        ${agCheck.warnings.map(w => `<p class="text-red-100">${w}</p>`).join('')}
      </div>`;
  }

  if (daData && daData.type === "asterisk") {
    html += `
      <div class="mt-4 p-4 bg-orange-950 border border-orange-500 rounded-2xl">
        <div class="flex items-center gap-2 text-orange-400 mb-3 font-semibold">⚠️ ASTERISK (*) CODE DETECTED</div>
        <p class="text-sm text-orange-100">This manifestation code <strong>must</strong> be paired with a Dagger (†) code.</p>
        <div class="mt-4 bg-zinc-900 p-3 rounded-xl">
          <div class="text-emerald-400 text-xs mb-1">SUGGESTED DAGGER CODE(S):</div>
          <div class="text-lg font-bold text-white">${daData.pairedWith.join(" or ")}</div>
          <div class="text-xs text-zinc-400 mt-1">${daData.note}</div>
        </div>
      </div>`;
  }

  if (ecCheck) {
    html += `
      <div class="mt-4 p-4 bg-blue-950 border border-blue-500 rounded-2xl">
        <div class="flex items-center gap-2 text-blue-400 mb-3 font-semibold">📋 EXTERNAL CAUSE CODE RECOMMENDED</div>
        <p class="text-sm text-blue-100">${ecCheck.message}</p>
      </div>`;
  }

  html += `</div>`;
  resultDiv.innerHTML = html;
}

// Patient Context
document.addEventListener('DOMContentLoaded', () => {
  const ageInput = document.getElementById('age');
  const maleBtn = document.getElementById('male');
  const femaleBtn = document.getElementById('female');
  const liveToggle = document.getElementById('live-toggle');

  if (ageInput) {
    ageInput.addEventListener('input', () => patientAge = parseInt(ageInput.value) || null);
  }

  if (maleBtn && femaleBtn) {
    maleBtn.addEventListener('click', () => {
      patientGender = 'M';
      maleBtn.classList.add('active');
      femaleBtn.classList.remove('active');
    });

    femaleBtn.addEventListener('click', () => {
      patientGender = 'F';
      femaleBtn.classList.add('active');
      maleBtn.classList.remove('active');
    });
  }

  if (liveToggle) {
    // initialize state: default off
    liveToggle.checked = false;
    liveToggle.addEventListener('change', async () => {
      const enabled = !!liveToggle.checked;
      // find currently active tab to associate live mode with
      try {
        const tabs = await new Promise((resolve) => chrome.tabs.query({ active: true, currentWindow: true }, resolve));
        const tabId = tabs && tabs[0] && tabs[0].id;
        if (tabId) {
          chrome.runtime.sendMessage({ action: 'SET_LIVE_MODE', tabId: tabId, enabled }, (resp) => {
            if (chrome.runtime.lastError) {
              console.warn('Failed to set live mode:', chrome.runtime.lastError);
            }
          });
        }
      } catch (e) {
        console.warn('Unable to set live mode:', e);
      }
    });
  }
});

// Live updates
chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log('ClaimAi sidepanel received message:', msg, sender);
  if ((msg.action === "liveUpdate" || msg.action === "lookup") && msg.code) {
    if (dataLoaded) {
      showResult(msg.code);
    } else {
      pendingLookup = msg.code;
    }
  }

  if (msg.action === 'LOAD_SELECTED_CODE' && msg.code) {
    chrome.runtime.sendMessage({ action: 'QUERY_CODE', code: msg.code }, (response) => {
      if (response && response.data) {
        renderDetails(response.data);
      } else {
        renderUnknown(msg.code);
      }
    });
    return true;
  }
});

loadData();

function renderDetails(data) {
  const titleEl = document.getElementById('code-title');
  const descEl = document.getElementById('code-description');
  const pmbEl = document.getElementById('pmb-status');
  const card = document.getElementById('code-card');

  const code = data.code || data.displayCode || '';
  const description = data.description || data.d || data.icdDescription || 'No description available.';

  if (titleEl) titleEl.textContent = code;
  if (descEl) descEl.textContent = description;
  if (pmbEl) {
    if (data.pmbCode) {
      pmbEl.textContent = `PMB Eligible (${data.pmbCode})`;
      pmbEl.className = 'mt-3 text-emerald-400 text-sm';
    } else {
      pmbEl.textContent = 'Not PMB Eligible';
      pmbEl.className = 'mt-3 text-zinc-400 text-sm';
    }
  }
  if (card) card.style.display = '';
}

function renderUnknown(code) {
  const titleEl = document.getElementById('code-title');
  const descEl = document.getElementById('code-description');
  const pmbEl = document.getElementById('pmb-status');
  const card = document.getElementById('code-card');

  if (titleEl) titleEl.textContent = code;
  if (descEl) descEl.textContent = 'Unknown or unsupported code.';
  if (pmbEl) {
    pmbEl.textContent = 'Unknown';
    pmbEl.className = 'status-badge unknown';
  }
  if (card) card.style.display = '';
}

/**
 * Render clickable suggestion pills that can inject codes into the active page.
 * @param {string[]} suggestions
 * @param {string} targetElementId
 */
function renderSuggestions(suggestions, targetElementId) {
  const listElement = document.getElementById(targetElementId);
  if (!listElement) return;
  listElement.innerHTML = '';

  suggestions.forEach(suggestedCode => {
    const item = document.createElement('button');
    item.className = 'suggestion-pill';
    item.innerText = `+ Append ${suggestedCode}`;

    item.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0]) return;
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'INJECT_CODE',
          code: suggestedCode
        });
      });
    });

    listElement.appendChild(item);
  });
}

// expose for other scripts if needed
self.renderSuggestions = renderSuggestions;
