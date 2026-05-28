// sidepanel.js
let icd10Index = {};
let pmbIndex = {};
let daggerAsteriskIndex = {};
let ageGenderRules = {};
let highRiskPairs = [];

let patientAge = null;
let patientGender = null; // "M", "F", or null

async function loadData() {
  try {
    const icdRes = await fetch(chrome.runtime.getURL('ICD-10-CM/diagnosis_codes.json'));
    const icdData = await icdRes.json();

    const pmbRes = await fetch(chrome.runtime.getURL('rules/pmb-linkages.json'));
    pmbIndex = await pmbRes.json();

    const daRes = await fetch(chrome.runtime.getURL('rules/dagger-asterisk-pairs.json'));
    daggerAsteriskIndex = await daRes.json();

    const agRes = await fetch(chrome.runtime.getURL('rules/age-gender-rules.json'));
    ageGenderRules = await agRes.json();

    const hrRes = await fetch(chrome.runtime.getURL('rules/high-risk-pairs.json'));
    highRiskPairs = await hrRes.json();

    let count = 0;

    function traverse(node) {
      if (!node) return;
      let code = (node.code || node.icd_code || '').toString().trim().toUpperCase();
      if (code) {
        icd10Index[code] = {
          d: node.desc_full || node.desc || node.description || node.icd_description || ""
        };
        count++;
      }
      if (Array.isArray(node.children)) node.children.forEach(traverse);
    }
    icdData.forEach(traverse);

    // === CRITICAL PATCH FOR MISSING CODES ===
    const criticalFixes = {
      "M01.1": { d: "Tuberculous arthritis" },
      "K67.3": { d: "Tuberculous peritonitis" },
      "G01":   { d: "Meningitis in bacterial diseases classified elsewhere" },
      "A80.9": { d: "Acute poliomyelitis, unspecified" },
      "G20":   { d: "Parkinson's disease" },
      "H32":   { d: "Chorioretinal disorders in diseases classified elsewhere" },
      "I39":   { d: "Endocarditis and heart valve disorders in diseases classified elsewhere" }
    };
    Object.assign(icd10Index, criticalFixes);
    // =======================================

    console.log(`✅ All data loaded successfully — ${Object.keys(icd10Index).length} ICD | ${Object.keys(pmbIndex).length} PMB | ${Object.keys(daggerAsteriskIndex).length} D/A | ${Object.keys(ageGenderRules).length} age/gender rules`);
  } catch (e) {
    console.error("Data load error:", e);
  }
}

function normalizeCode(code) {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

function checkHighRisk(code) {
  // Returns matching pair rules where the code is one of the pair members
  return highRiskPairs.filter(pair => {
    return pair.codes.some(c => {
      if (c.includes('-')) {
        const [start, end] = c.split('-');
        return code >= start && code <= end;
      }
      return code.startsWith(c) || c.startsWith(code);
    });
  });
}

function checkAgeGender(code) {
  let cleanCode = normalizeCode(code);

  // Check direct code match first, then chapter-level range keys
  const rule = ageGenderRules[cleanCode] ||
               Object.entries(ageGenderRules).find(([key]) => {
                 if (!key.includes('-')) return false;
                 const [start, end] = key.split('-');
                 return cleanCode >= start && cleanCode <= end;
               })?.[1];

  if (!rule) return null;

  const warnings = [];

  if (rule.ageMax !== undefined && patientAge !== null && patientAge > rule.ageMax) {
    warnings.push(`This code is typically for patients under ${rule.ageMax < 1 ? '28 days' : `${rule.ageMax} years`} old.`);
  }

  if (rule.gender && patientGender && rule.gender !== patientGender) {
    warnings.push(`This code is restricted to ${rule.gender === 'M' ? 'Male' : 'Female'} patients.`);
  }

  return warnings.length > 0 ? { warnings, rule } : null;
}

function showResult(code) {
  const resultDiv = document.getElementById('result');
  let cleanCode = normalizeCode(code);

  // Try multiple matching strategies
  let icdData = icd10Index[cleanCode] ||
                icd10Index[cleanCode.replace('.', '')] ||
                icd10Index[cleanCode.replace(/(\w{3})(\d)/, '$1.$2')];

  const pmbData = pmbIndex[cleanCode] || pmbIndex[cleanCode.replace('.', '')];
  const daData = daggerAsteriskIndex[cleanCode + '*'] || daggerAsteriskIndex[cleanCode];
  const agCheck = checkAgeGender(cleanCode);
  const hrMatches = checkHighRisk(cleanCode);

  let html = `<div class="card">`;

  // Main ICD Info
  if (icdData) {
    html += `<div class="code">${cleanCode}</div>`;
    html += `<p class="text-zinc-200">${icdData.d}</p>`;
    html += `<div class="mt-3 text-emerald-400 text-sm">✓ VALID ICD-10 Code</div>`;
  } else {
    html += `<div class="code text-amber-400">${cleanCode}</div>`;
    html += `<p class="text-amber-300">Code not found in main ICD-10 dataset (possibly incomplete data).</p>`;
  }

  // PMB Section
  if (pmbData) {
    html += `
      <div class="pmb-box mt-4">
        <div class="flex items-center gap-2 text-emerald-400 mb-2 font-medium">🛡️ PMB-ELIGIBLE CONDITION</div>
        <div class="text-sm">${pmbData.pmbDescription || pmbData.icdDescription}</div>
      </div>`;
  }

  // Age / Gender Warning
  if (agCheck) {
    html += `
      <div class="mt-4 p-4 bg-red-950 border border-red-600 rounded-2xl">
        <div class="flex items-center gap-2 text-red-400 mb-3 font-semibold">
          ⚠️ DEMOGRAPHIC MISMATCH
        </div>
        ${agCheck.warnings.map(w => `<p class="text-red-100 text-sm">${w}</p>`).join('')}
      </div>`;
  }

  // High-Risk Pair Warning
  if (hrMatches.length > 0) {
    html += `
      <div class="mt-4 p-4 bg-red-950 border border-red-700 rounded-2xl">
        <div class="flex items-center gap-2 text-red-400 mb-3 font-semibold">
          🚨 HIGH-RISK CODE COMBINATION
        </div>
        ${hrMatches.map(m => `
          <p class="text-red-100 text-sm mb-1">⚠️ ${m.reason}</p>
          <div class="text-xs text-red-300">Pair: ${m.codes.join(' + ')}</div>
        `).join('<hr class="border-red-800 my-2">')}
      </div>`;
  }

  // Dagger/Asterisk Section
  if (daData && daData.type === "asterisk") {
    html += `
      <div class="mt-4 p-4 bg-orange-950 border border-orange-500 rounded-2xl">
        <div class="flex items-center gap-2 text-orange-400 mb-3 font-semibold">
          ⚠️ ASTERISK (*) CODE DETECTED
        </div>
        <p class="text-sm text-orange-100">This manifestation code <strong>must</strong> be paired with a Dagger (†) code.</p>
        <div class="mt-4 bg-zinc-900 p-3 rounded-xl">
          <div class="text-emerald-400 text-xs mb-1">SUGGESTED DAGGER CODE(S):</div>
          <div class="text-lg font-bold text-white">${daData.pairedWith.join(" or ")}</div>
          <div class="text-xs text-zinc-400 mt-1">${daData.note}</div>
        </div>
      </div>`;
  }

  html += `</div>`;
  resultDiv.innerHTML = html;
}

// Listeners
chrome.runtime.onMessage.addListener((msg) => {
  if ((msg.action === "liveUpdate" || msg.action === "lookup") && msg.code) {
    showResult(msg.code);
  }
  // Allow content script to update patient context
  if (msg.action === "setPatientContext") {
    if (msg.age !== undefined) patientAge = msg.age;
    if (msg.gender !== undefined) patientGender = msg.gender;
  }
});

loadData();
