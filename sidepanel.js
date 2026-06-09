// sidepanel.js
let icd10Index = {};
let pmbIndex = {};
let daggerAsteriskIndex = {};
let ageGenderRules = {};
let externalCauseRules = {};

let patientAge = null;
let patientGender = null;
let dataLoaded = false;
let pendingLookup = null;

async function loadData() {
  try {
    // Load new clean CDC dataset from the single canonical location
    const mod = await import(chrome.runtime.getURL('lib/icd10-index.js'));
    if (mod) {
      icd10Index = mod.icd10Index || mod.default || mod || {};
    }
    if (!icd10Index || !Object.keys(icd10Index).length) {
      console.warn('ICD index loaded but empty from lib/icd10-index.js');
    } else {
      console.log(`Loaded ICD index (${Object.keys(icd10Index).length} codes) from lib/icd10-index.js`);
    }

    // Load rules
    const pmbRes = await fetch(chrome.runtime.getURL('rules/pmb-linkages.json'));
    pmbIndex = normalizeSourceIndex(await pmbRes.json());

    const daRes = await fetch(chrome.runtime.getURL('rules/dagger-asterisk-pairs.json'));
    daggerAsteriskIndex = normalizeSourceIndex(await daRes.json());

    const agRes = await fetch(chrome.runtime.getURL('rules/age-gender-rules.json'));
    ageGenderRules = await agRes.json();

    const ecRes = await fetch(chrome.runtime.getURL('rules/external-cause-rules.json'));
    externalCauseRules = await ecRes.json();

    console.log(`✅ ClaimAi loaded ${Object.keys(icd10Index).length} ICD-10 codes (CDC 2026)`);
    dataLoaded = true;
    if (pendingLookup) {
      showResult(pendingLookup);
      pendingLookup = null;
    }
  } catch (e) {
    console.error("Data load error:", e);
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

function showResult(code) {
  const resultDiv = document.getElementById('result');
  let cleanCode = normalizeCode(code);

  const icdData = lookupIndex(icd10Index, cleanCode);
  const pmbData = lookupIndex(pmbIndex, cleanCode);
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

  ageInput.addEventListener('input', () => patientAge = parseInt(ageInput.value) || null);

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
});

loadData();
