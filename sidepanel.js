// sidepanel.js
let icd10Index = {};
let pmbIndex = {};
let daggerAsteriskIndex = {};
let ageGenderRules = {};
let externalCauseRules = {};
let highRiskPairs = [];
let dbInstance = null;

let patientAge = null;
let patientGender = null;
let dataLoaded = false;
let pendingLookup = null;
let currentLiveCodes = [];

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
    const hrRes = await fetch(chrome.runtime.getURL('rules/high-risk-pairs.json'));
    highRiskPairs = await hrRes.json();

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
  let clean = code.trim().toUpperCase().replace(/\s+/g, '');
  if (clean.startsWith('0')) {
    clean = 'O' + clean.slice(1);
  }
  return clean;
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

function matchesRuleCode(actualCode, ruleCode) {
  const cleanActual = normalizeCode(actualCode).replace('.', '');
  if (ruleCode.includes('-')) {
    const [start, end] = ruleCode.split('-');
    const letter = start.charAt(0);
    if (cleanActual.charAt(0) !== letter) return false;
    const num = parseInt(cleanActual.substring(1, 3), 10);
    const startNum = parseInt(start.substring(1), 10);
    const endNum = parseInt(end.substring(1), 10);
    return num >= startNum && num <= endNum;
  } else {
    return cleanActual.startsWith(ruleCode.replace('.', ''));
  }
}

function checkHighRisk(code, activeCodes) {
  const cleanCode = normalizeCode(code);
  const applicableRules = highRiskPairs.filter(rule => 
    rule.codes.some(rc => matchesRuleCode(cleanCode, rc))
  );

  if (applicableRules.length === 0) return null;

  return applicableRules.map(rule => {
    const otherRuleCodes = rule.codes.filter(rc => !matchesRuleCode(cleanCode, rc));
    let conflictPresent = false;
    let conflictingActiveCode = null;
    
    for (const active of activeCodes) {
      const cleanActive = normalizeCode(active);
      if (cleanActive !== cleanCode && otherRuleCodes.some(orc => matchesRuleCode(cleanActive, orc))) {
        conflictPresent = true;
        conflictingActiveCode = active;
        break;
      }
    }

    return { rule, conflictPresent, conflictingActiveCode, otherRuleCodes };
  });
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
  const hrCheck = checkHighRisk(cleanCode, currentLiveCodes);

  let html = `<div class="card">`;
  const description = icdData?.d || pmbData?.pmbDescription || pmbData?.icdDescription || (ecCheck ? `Injury Category: ${ecCheck.category}` : 'No description available.');

  if (icdData || pmbData || daData) {
    html += `<div class="code">${cleanCode}</div>`;
    if (!icdData && !pmbData && daData) {
       html += `<p class="text-zinc-200">${daData.note || 'Dagger/Asterisk manifestation code.'}</p>`;
       html += `<div class="mt-3 text-emerald-400 text-sm">✓ VALID DAGGER PAIR</div>`;
    } else {
       html += `<p class="text-zinc-200">${description}</p>`;
       html += `<div class="mt-3 text-emerald-400 text-sm">✓ VALID ICD-10 Code${pmbData ? ' · PMB eligible' : ''}</div>`;
    }
  } else if (ecCheck) {
    html += `<div class="code text-blue-400">${cleanCode}</div>`;
    html += `<p class="text-zinc-200">${description}</p>`;
    html += `<div class="mt-3 text-blue-400 text-sm">ℹ️ Incomplete Code (Category)</div>`;
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
        <div class="mt-4 p-4 bg-green-950 border border-green-500 rounded-2xl">
          <div class="flex items-center gap-2 text-green-400 mb-3 font-semibold">✅ DAGGER CODE PAIR</div>
          <p class="text-sm text-green-100">This manifestation code is paired with dagger code(s):</p>
          <div class="mt-2 bg-zinc-900 p-3 rounded-xl">
            <div class="text-emerald-400 text-xs mb-1">SUGGESTED DAGGER CODE(S):</div>
            <div class="text-lg font-bold text-white">${daData.pairedWith.join(" or ")}</div>
            <div class="text-xs text-zinc-400 mt-1">${daData.note}</div>
          </div>
        </div>`;
    }

  if (hrCheck && hrCheck.length > 0) {
    html += `<div class="mt-4 p-4 bg-orange-950 border border-orange-500 rounded-2xl">`;
    html += `<div class="flex items-center gap-2 text-orange-400 mb-3 font-semibold">⚠️ HIGH RISK BILLING PAIR</div>`;
    
    hrCheck.forEach(item => {
      if (item.conflictPresent) {
         html += `<p class="text-sm text-orange-100 mb-2">🔥 <b>CONFLICT DETECTED:</b> This code conflicts with active code <b>${item.conflictingActiveCode}</b>.</p>`;
         html += `<p class="text-sm text-orange-200">Reason: ${item.rule.reason}</p>`;
      } else {
         html += `<p class="text-sm text-orange-100 mb-2">Avoid billing with: <b>${item.otherRuleCodes.join(', ')}</b></p>`;
         html += `<p class="text-sm text-orange-200">Reason: ${item.rule.reason}</p>`;
      }
    });
    html += `</div>`;
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
    // Load persisted state, default to true
    chrome.storage.local.get(['liveModeEnabled'], (result) => {
      const enabled = result.liveModeEnabled !== false; // default to true
      liveToggle.checked = enabled;
      // Sync state with background
      chrome.runtime.sendMessage({ action: 'SET_LIVE_MODE', enabled });
    });

    liveToggle.addEventListener('change', () => {
      const enabled = !!liveToggle.checked;
      chrome.storage.local.set({ liveModeEnabled: enabled });
      chrome.runtime.sendMessage({ action: 'SET_LIVE_MODE', enabled });
    });
  }
});

// Live updates
chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log('ClaimAi sidepanel received message:', msg, sender);

  if (msg.action === "liveUpdate" && msg.results) {
    currentLiveCodes = msg.results.map(r => r.normalized || r.raw);
  }

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
