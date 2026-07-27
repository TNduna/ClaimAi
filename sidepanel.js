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

// Markdown Standards state
let parsedSections = [];
let ethicsTips = [];
let currentEthicsIndex = 0;

async function loadData() {
  try {
    // Load index and rules into memory (no direct DB initialization from sidepanel)
    try {
      const resp = await fetch(chrome.runtime.getURL('lib/icd10-index.json'));
      if (resp.ok) icd10Index = await resp.json();
    } catch (e) {
      console.warn('Failed to load icd10 index for sidepanel:', e);
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

    // Load and parse Morbidity Coding Standards Markdown
    await loadMorbidityStandards();
  } catch (e) {
    console.error('Data load error:', e);
  }
}

/**
 * Loads the Morbidity Coding Standards Markdown file, parses it into structured
 * sections, and extracts the clinical ethics principles.
 */
async function loadMorbidityStandards() {
  try {
    const resp = await fetch(chrome.runtime.getURL('ClaimAi/SA_ICD10_Morbidity_Coding_Standards.md'));
    if (!resp.ok) throw new Error('Failed to load morbidity standards MD file');
    const mdText = await resp.text();
    
    // Parse sections
    const lines = mdText.split('\n');
    let currentSection = null;
    parsedSections = [];
    
    for (const line of lines) {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        if (currentSection) {
          parsedSections.push(currentSection);
        }
        const level = line.startsWith('## ') ? 2 : 3;
        const title = line.replace(/^##\s+|###\s+/, '').trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        currentSection = {
          id,
          title,
          level,
          body: '',
          code: extractCodeFromTitle(title)
        };
      } else if (currentSection) {
        currentSection.body += line + '\n';
      }
    }
    if (currentSection) {
      parsedSections.push(currentSection);
    }
    
    // Extract Ethics Tips from the Ethics section
    const ethicsSection = parsedSections.find(s => s.id.includes('ethics'));
    if (ethicsSection) {
      const principles = ethicsSection.body.split(/\n\s*\d+[\)\.]\s*/);
      ethicsTips = principles.slice(1).map(p => p.trim()).filter(p => p.length > 0);
    }
    
    // Fallback ethics tips if parsing failed
    if (ethicsTips.length === 0) {
      ethicsTips = [
        "Clinical Coders shall perform their work with honesty, attentiveness, and responsibility.",
        "Clinical coders shall refuse to participate in or conceal any illegal, unlawful or unethical processes.",
        "Clinical Coders should only assign and report codes that are clearly supported by practitioner documentation.",
        "Clinical coders shall ensure that clinical record content justifies selection of diagnosis, procedures, and treatment."
      ];
    }
    
    renderRuleExplorer();
    showRandomEthicsTip();
  } catch (e) {
    console.warn('Morbidity Standards load/parse failed:', e);
  }
}

function extractCodeFromTitle(title) {
  const match = title.match(/\b(GSN\d+|DSN\d+)\b/i);
  return match ? match[1].toUpperCase() : null;
}

function formatMarkdownToHTML(mdText) {
  if (!mdText) return '';
  return mdText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/^\s*>\s*\[\!IMPORTANT\]\s*(.*?)$/gm, '<blockquote style="border-left-color: var(--danger);">$1</blockquote>')
    .replace(/^\s*>\s*\[\!NOTE\]\s*(.*?)$/gm, '<blockquote style="border-left-color: var(--info);">$1</blockquote>')
    .replace(/^\s*>\s*(.*?)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\s*[\-\*]\s*(.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>')
    .replace(/\n\n+/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function renderRuleExplorer() {
  const container = document.getElementById('rule-explorer-container');
  if (!container) return;
  
  // Filter sections that represent validation rules or GSN/DSN guidelines
  const ruleSections = parsedSections.filter(s => s.code || s.id.includes('rule') || s.title.includes('GSN') || s.title.includes('DSN'));
  
  if (ruleSections.length === 0) {
    container.innerHTML = '<div style="font-size: 12px; color: var(--text-muted);">No rules found.</div>';
    return;
  }
  
  let html = '';
  ruleSections.forEach(section => {
    const formattedBody = formatMarkdownToHTML(section.body);
    html += `
      <details class="rule-card" id="rule-${section.id}">
        <summary class="rule-card-header">${escapeHTML(section.title)}</summary>
        <div class="rule-card-body">
          ${formattedBody}
        </div>
      </details>
    `;
  });
  
  container.innerHTML = html;
}

function showRandomEthicsTip() {
  const tipText = document.getElementById('ethics-tip-text');
  if (!tipText || ethicsTips.length === 0) return;
  currentEthicsIndex = Math.floor(Math.random() * ethicsTips.length);
  tipText.textContent = ethicsTips[currentEthicsIndex];
}

function searchMorbidityStandards(query) {
  const resultsDiv = document.getElementById('standards-search-results');
  if (!resultsDiv) return;
  
  if (!query || query.trim().length < 2) {
    resultsDiv.style.display = 'none';
    return;
  }
  
  const cleanQuery = query.toLowerCase().trim();
  const matches = parsedSections.filter(section => 
    section.title.toLowerCase().includes(cleanQuery) || 
    section.body.toLowerCase().includes(cleanQuery)
  );
  
  if (matches.length === 0) {
    resultsDiv.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 8px;">No matches found.</div>';
    resultsDiv.style.display = 'block';
    return;
  }
  
  let html = '';
  matches.forEach(match => {
    const bodyLower = match.body.toLowerCase();
    const idx = bodyLower.indexOf(cleanQuery);
    let snippet = '';
    if (idx !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(match.body.length, idx + 60);
      snippet = '...' + match.body.substring(start, end).replace(/\n/g, ' ') + '...';
    } else {
      snippet = match.body.substring(0, 100).replace(/\n/g, ' ') + '...';
    }
    
    html += `
      <div class="search-result-item" data-id="${match.id}">
        <div class="search-result-title">${escapeHTML(match.title)}</div>
        <div class="search-result-snippet">${escapeHTML(snippet)}</div>
      </div>
    `;
  });
  
  resultsDiv.innerHTML = html;
  resultsDiv.style.display = 'block';
  
  // Bind click listeners to results to scroll rule explorer
  resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const detailsEl = document.getElementById(`rule-${id}`);
      if (detailsEl) {
        detailsEl.setAttribute('open', 'true');
        detailsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        detailsEl.style.borderColor = 'var(--primary)';
        setTimeout(() => {
          detailsEl.style.borderColor = 'var(--surface-border)';
        }, 1500);
      }
    });
  });
}

function searchIcd10Codes(query) {
  const resultsDiv = document.getElementById('icd-search-results');
  if (!resultsDiv) return;

  if (!query || query.trim().length < 2) {
    resultsDiv.style.display = 'none';
    return;
  }

  const cleanQuery = query.toLowerCase().trim();
  const isCodeQuery = /^[a-z][0-9]/i.test(cleanQuery);
  const matches = [];

  if (isCodeQuery) {
    const normalizedQuery = cleanQuery.replace(/\./g, '').toUpperCase();
    for (const key of Object.keys(icd10Index)) {
      const normKey = key.replace(/\./g, '').toUpperCase();
      if (normKey.startsWith(normalizedQuery)) {
        if (!matches.some(m => m.code === key || m.code.replace(/\./g, '') === normKey)) {
          matches.push({ code: key, d: icd10Index[key].d });
          if (matches.length >= 50) break;
        }
      }
    }
  } else {
    for (const key of Object.keys(icd10Index)) {
      const desc = (icd10Index[key].d || '').toLowerCase();
      if (desc.includes(cleanQuery)) {
        const normKey = key.replace(/\./g, '').toUpperCase();
        if (!matches.some(m => m.code === key || m.code.replace(/\./g, '') === normKey)) {
          matches.push({ code: key, d: icd10Index[key].d });
          if (matches.length >= 50) break;
        }
      }
    }
  }

  if (matches.length === 0) {
    resultsDiv.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 8px;">No matching codes found.</div>';
    resultsDiv.style.display = 'block';
    return;
  }

  let html = '';
  matches.forEach(match => {
    html += `
      <div class="search-result-item" data-code="${escapeHTML(match.code)}">
        <div class="search-result-title">${escapeHTML(match.code)}</div>
        <div class="search-result-snippet">${escapeHTML(match.d)}</div>
      </div>
    `;
  });

  resultsDiv.innerHTML = html;
  resultsDiv.style.display = 'block';

  // Bind click listeners
  resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const code = item.getAttribute('data-code');
      const tabScan = document.getElementById('tab-scan');
      if (tabScan) {
        tabScan.click();
      }
      const previewCard = document.getElementById('claim-preview-card');
      if (previewCard) {
        previewCard.style.display = 'none';
      }
      showResult(code);
    });
  });
}


function getExcerptForFinding(finding) {
  let ruleCode = null;
  const msg = (finding.message || '').toUpperCase();
  
  if (finding.type === 'PRIMARY_ERROR') ruleCode = 'GSN0001';
  else if (finding.type === 'PAIRING_ERROR') ruleCode = 'GSN0010';
  else if (finding.type === 'SEQUENCE_ERROR') ruleCode = 'GSN0010';
  else if (msg.includes('B22.7')) ruleCode = 'DSN0101';
  else if (msg.includes('C97')) ruleCode = 'DSN0201';
  else if (msg.includes('U50')) ruleCode = 'DSN2201';
  else if (msg.includes('Z51')) ruleCode = 'DSN0201';
  else if (msg.includes('X PLACEHOLDER')) ruleCode = 'GSN0009';
  else if (msg.includes('TRIGGER FINGER') || msg.includes('M71.56')) ruleCode = 'GSN0011';
  else if (msg.includes('SEPARATING') || msg.includes('DELIMITER')) ruleCode = 'GSN0104';

  if (!ruleCode) return '';

  const section = parsedSections.find(s => s.code === ruleCode || s.title.includes(ruleCode));
  if (section) {
    const lines = section.body.split('\n').filter(l => l.trim().length > 0).slice(0, 2).join(' ');
    return `<div style="font-size: 11px; margin-top: 6px; padding-left: 8px; border-left: 2px solid var(--info); color: var(--text-muted); font-style: italic;">
      <b>Per ${ruleCode}:</b> ${escapeHTML(lines)}...
    </div>`;
  }
  return '';
}

const normalizeCode = window.ClaimAiUtils.normalizeCode;
const getCodeVariants = window.ClaimAiUtils.buildLookupVariants;

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

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Watch tab updates and activations
chrome.tabs.onActivated.addListener(checkTabPermission);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    checkTabPermission();
  }
});

async function checkTabPermission() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;

    // Ignore internal pages
    if (tab.url.startsWith('chrome:') || tab.url.startsWith('chrome-extension:') || tab.url.startsWith('about:')) {
      const banner = document.getElementById('permission-banner');
      if (banner) banner.style.display = 'none';
      return;
    }

    const url = new URL(tab.url);
    const origin = `${url.protocol}//${url.host}/*`;

    chrome.permissions.contains({ origins: [origin] }, (hasPermission) => {
      const banner = document.getElementById('permission-banner');
      if (!banner) return;

      if (hasPermission) {
        banner.style.display = 'none';
      } else {
        banner.style.display = 'flex';
        const grantBtn = document.getElementById('grant-permission-btn');
        if (grantBtn) {
          grantBtn.onclick = () => {
            chrome.permissions.request({ origins: [origin] }, (granted) => {
              if (granted) {
                banner.style.display = 'none';
                chrome.tabs.reload(tab.id);
              }
            });
          };
        }
      }
    });
  } catch (e) {
    console.warn('ClaimAi: Permission check failed:', e);
  }
}

async function showResult(code) {
  const resultDiv = document.getElementById('result');
  
  // Track lookup feature usage
  try {
    window.ClaimAiTelemetry.trackFeatureUse('lookup');
  } catch (e) {}

  // Hide current result card if it's there
  const codeCard = document.getElementById('code-card');
  if (codeCard) codeCard.style.display = 'none';

  // Show skeleton loader card
  let skeleton = document.getElementById('skeleton-loader');
  if (!skeleton) {
    skeleton = document.createElement('div');
    skeleton.id = 'skeleton-loader';
    skeleton.className = 'skeleton-card';
    skeleton.innerHTML = `
      <div class="skeleton-title pulse"></div>
      <div class="skeleton-line pulse" style="width: 90%;"></div>
      <div class="skeleton-line pulse" style="width: 75%;"></div>
      <div class="skeleton-line pulse" style="width: 50%;"></div>
    `;
    resultDiv.appendChild(skeleton);
  }
  skeleton.style.display = 'block';

  // Wait 150ms to ensure the user gets a smooth loading pulse transitions
  await new Promise(resolve => setTimeout(resolve, 150));

  let cleanCode = normalizeCode(code);
  let icdData = null;
  let pmbData = null;

  try {
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
  } catch (err) {
    console.error('ClaimAi: Database query failed during showResult:', err);
    try {
      window.ClaimAiTelemetry.trackFeatureUse('error');
    } catch (e) {}
  }

  const daData = lookupIndex(daggerAsteriskIndex, cleanCode + '*') || lookupIndex(daggerAsteriskIndex, cleanCode);
  const agCheck = checkAgeGender(cleanCode);
  const ecCheck = checkExternalCause(cleanCode);
  const hrCheck = checkHighRisk(cleanCode, currentLiveCodes);

  // Hide skeleton loader once query completes
  skeleton.style.display = 'none';

  let cardClass = 'card';
  if (!(icdData || pmbData || daData)) {
    if (ecCheck) {
      cardClass += ' card-info';
    } else {
      cardClass += ' card-warning';
    }
  } else if (agCheck) {
    cardClass += ' card-danger';
  } else if (hrCheck && hrCheck.length > 0) {
    cardClass += ' card-warning';
  }

  let html = `<div class="${cardClass}">`;
  const description = icdData?.d || pmbData?.pmbDescription || pmbData?.icdDescription || (ecCheck ? `Injury Category: ${ecCheck.category}` : 'No description available.');

  if (icdData || pmbData || daData) {
    html += `<div class="code">${escapeHTML(cleanCode)}</div>`;
    if (!icdData && !pmbData && daData) {
       html += `<p class="description-text">${escapeHTML(daData.note || 'Dagger/Asterisk manifestation code.')}</p>`;
       html += `<div class="mt-3 text-emerald-400 text-sm font-semibold">✓ VALID DAGGER PAIR</div>`;
    } else {
       html += `<p class="description-text">${escapeHTML(description)}</p>`;
       html += `<div class="mt-3 text-emerald-400 text-sm font-semibold">✓ VALID ICD-10 Code${pmbData ? ' · PMB eligible' : ''}</div>`;
    }
  } else if (ecCheck) {
    html += `<div class="code text-blue-400">${escapeHTML(cleanCode)}</div>`;
    html += `<p class="description-text">${escapeHTML(description)}</p>`;
    html += `<div class="mt-3 text-blue-400 text-sm font-semibold">ℹ️ Incomplete Code (Category)</div>`;
  } else {
    try {
      window.ClaimAiTelemetry.trackFeatureUse('error');
    } catch (e) {}
    html += `
      <div class="error-title-container">
        <span>⚠️ Code Not Found</span>
      </div>
      <div class="code text-amber-400">${escapeHTML(cleanCode)}</div>
      <p class="error-desc">No matching South African ICD-10 clinical diagnostic code was found in the database. Please verify the characters and try again.</p>
    `;
  }

  if (pmbData) {
    html += `
      <div class="pmb-box">
        <div class="pmb-title">🛡️ PMB-ELIGIBLE CONDITION</div>
        <div class="text-sm">${escapeHTML(pmbData.pmbDescription || pmbData.icdDescription)}</div>
      </div>`;
  }

  if (agCheck) {
    html += `
      <div class="alert-box danger">
        <div class="alert-title">⚠️ DEMOGRAPHIC MISMATCH</div>
        ${agCheck.warnings.map(w => `<div class="alert-content">${escapeHTML(w)}</div>`).join('')}
      </div>`;
  }

  if (daData && daData.type === "asterisk") {
    html += `
      <div class="alert-box info">
        <div class="alert-title">✅ DAGGER CODE PAIR</div>
        <div class="alert-content">
          <p class="text-sm">This manifestation code is paired with dagger code(s):</p>
          <div class="mt-2 bg-zinc-900 p-3 rounded-xl">
            <div class="text-emerald-400 text-xs mb-1">SUGGESTED DAGGER CODE(S):</div>
            <div class="text-lg font-bold text-white">${escapeHTML(daData.pairedWith.join(" or "))}</div>
            <div class="text-xs text-zinc-400 mt-1">${escapeHTML(daData.note)}</div>
          </div>
        </div>
      </div>`;
  }

  if (hrCheck && hrCheck.length > 0) {
    html += `<div class="alert-box warning">`;
    html += `<div class="alert-title">⚠️ HIGH RISK BILLING PAIR</div>`;
    
    hrCheck.forEach(item => {
      if (item.conflictPresent) {
         html += `<div class="alert-content mb-2">🔥 <b>CONFLICT DETECTED:</b> This code conflicts with active code <b>${escapeHTML(item.conflictingActiveCode)}</b>.</div>`;
         html += `<div class="alert-content">Reason: ${escapeHTML(item.rule.reason)}</div>`;
      } else {
         html += `<div class="alert-content mb-2">Avoid billing with: <b>${escapeHTML(item.otherRuleCodes.join(', '))}</b></div>`;
         html += `<div class="alert-content">Reason: ${escapeHTML(item.rule.reason)}</div>`;
      }
    });
    html += `</div>`;
  }

  html += `</div>`;
  resultDiv.innerHTML = html;
}

// Patient Context, Tab Navigation & Search Listeners
document.addEventListener('DOMContentLoaded', () => {
  const ageInput = document.getElementById('age');
  const maleBtn = document.getElementById('male');
  const femaleBtn = document.getElementById('female');
  const liveToggle = document.getElementById('live-toggle');

  // Tabswitching bindings
  const tabScan = document.getElementById('tab-scan');
  const tabStandards = document.getElementById('tab-standards');
  const scanContent = document.getElementById('scan-tab-content');
  const standardsContent = document.getElementById('standards-tab-content');

  if (tabScan && tabStandards && scanContent && standardsContent) {
    tabScan.addEventListener('click', () => {
      tabScan.classList.add('active');
      tabStandards.classList.remove('active');
      scanContent.style.display = 'block';
      standardsContent.style.display = 'none';
    });

    tabStandards.addEventListener('click', () => {
      tabStandards.classList.add('active');
      tabScan.classList.remove('active');
      standardsContent.style.display = 'block';
      scanContent.style.display = 'none';
    });
  }

  // Standards search binder
  const searchInput = document.getElementById('standards-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchMorbidityStandards(searchInput.value);
    });
  }

  // ICD-10 Search binder
  const icdSearchInput = document.getElementById('icd-search-input');
  if (icdSearchInput) {
    let debounceTimer = null;
    icdSearchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchIcd10Codes(icdSearchInput.value);
      }, 200);
    });
  }

  // Ethics tip rotator
  const nextTipBtn = document.getElementById('next-tip-btn');
  if (nextTipBtn) {
    nextTipBtn.addEventListener('click', showRandomEthicsTip);
  }

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
    chrome.storage.local.get(['liveModeEnabled'], (result) => {
      const enabled = result.liveModeEnabled !== false;
      liveToggle.checked = enabled;
      chrome.runtime.sendMessage({ action: 'SET_LIVE_MODE', enabled });
    });

    liveToggle.addEventListener('change', () => {
      const enabled = !!liveToggle.checked;
      chrome.storage.local.set({ liveModeEnabled: enabled });
      chrome.runtime.sendMessage({ action: 'SET_LIVE_MODE', enabled });
    });
  }

  try {
    window.ClaimAiTelemetry.initializeTelemetry().then(() => {
      updateTelemetryUI();

      const telemetryToggle = document.getElementById('telemetry-toggle');
      if (telemetryToggle) {
        telemetryToggle.addEventListener('change', () => {
          window.ClaimAiTelemetry.setConsent(telemetryToggle.checked).then(updateTelemetryUI);
        });
      }

      const viewPayloadBtn = document.getElementById('view-payload-btn');
      const payloadContainer = document.getElementById('payload-display-container');
      if (viewPayloadBtn && payloadContainer) {
        viewPayloadBtn.addEventListener('click', () => {
          const isHidden = payloadContainer.style.display === 'none';
          payloadContainer.style.display = isHidden ? 'block' : 'none';
          viewPayloadBtn.textContent = isHidden ? 'Hide Raw Payload' : 'View Raw Payload';
        });
      }
    });

    window.ClaimAiTelemetry.trackFeatureUse('sidepanelOpen');
  } catch (e) {
    console.warn('ClaimAi Telemetry: Failed to bind UI listeners', e);
  }

  checkTabPermission();
});

function updateClaimLinePreview(formatValidation, submissionPreview, sequenceValidation, results) {
  const card = document.getElementById('claim-preview-card');
  const previewText = document.getElementById('claim-preview-text');
  const previewStatus = document.getElementById('claim-preview-status');
  
  if (!card || !previewText || !previewStatus) return;

  if (!submissionPreview) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'block';
  previewText.textContent = submissionPreview;
  
  let html = '';

  // 1. Formatting Warnings
  if (formatValidation && formatValidation.length > 0) {
    html += '<div style="color: var(--danger); font-weight: 700; margin-bottom: 6px;">⚠️ Formatting Warnings:</div>';
    html += '<ul style="margin: 0 0 10px 0; padding-left: 18px; color: var(--text-muted);">';
    formatValidation.forEach(err => {
      const excerpt = getExcerptForFinding(err);
      html += `<li style="margin-bottom: 6px;">
        <div>${escapeHTML(err.message)}</div>
        ${excerpt}
      </li>`;
    });
    html += '</ul>';
  }

  // 2. Clinical & Sequencing Warnings
  if (sequenceValidation && sequenceValidation.findings && sequenceValidation.findings.length > 0) {
    html += '<div style="color: var(--warning); font-weight: 700; margin-bottom: 6px;">⚠️ Clinical & Sequencing Warnings:</div>';
    html += '<ul style="margin: 0 0 10px 0; padding-left: 18px; color: var(--text-muted);">';
    sequenceValidation.findings.forEach(finding => {
      const excerpt = getExcerptForFinding(finding);
      html += `<li style="margin-bottom: 8px;">
        <div>${escapeHTML(finding.message)}</div>
        ${excerpt}
      </li>`;
    });
    html += '</ul>';
  }

  // 3. Suggested Primary Swaps
  if (sequenceValidation && sequenceValidation.suggestedPrimary) {
    const excerpt = getExcerptForFinding({ type: 'PRIMARY_ERROR', message: '' });
    html += `
      <div style="background-color: var(--info-bg); border: 1px solid var(--info-border); border-radius: 8px; padding: 10px; margin-top: 10px;">
        <div style="color: var(--info); font-weight: 700; font-size: 12px; margin-bottom: 4px;">💡 SUGGESTED PRIMARY SWAP</div>
        <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">We suggest using <b>${escapeHTML(sequenceValidation.suggestedPrimary)}</b> as the primary diagnosis.</div>
        ${excerpt}
      </div>
    `;
  }

  const hasInvalidCodes = results && results.some(r => !r.isValid);

  if (html === '') {
    if (hasInvalidCodes) {
      previewStatus.innerHTML = '<div style="color: var(--warning); font-weight: 700;">Format only — code unrecognized in database.</div>';
      previewText.style.color = 'var(--warning)';
      previewText.style.borderColor = 'var(--warning-border)';
      card.className = 'card card-warning';
    } else {
      previewStatus.innerHTML = '<div style="color: var(--primary); font-weight: 700;">✓ Submission format is valid & POPIA/NDoH compliant.</div>';
      previewText.style.color = '#10b981';
      previewText.style.borderColor = 'var(--surface-border)';
      card.className = 'card';
    }
  } else {
    previewStatus.innerHTML = html;
    previewText.style.color = 'var(--warning)';
    previewText.style.borderColor = 'var(--warning-border)';
    if (formatValidation && formatValidation.length > 0) {
      card.className = 'card card-danger';
    } else {
      card.className = 'card card-warning';
    }
  }
}

// Live updates
chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log('ClaimAi sidepanel received message:', msg, sender);

  if (msg.action === "liveUpdate" && msg.results) {
    currentLiveCodes = msg.results.map(r => r.normalized || r.raw);
    updateClaimLinePreview(msg.formatValidation, msg.submissionPreview, msg.sequenceValidation, msg.results);
  }

  if (msg.action === "lookup") {
    // Hide preview on manual search queries
    const card = document.getElementById('claim-preview-card');
    if (card) card.style.display = 'none';
  }

  if ((msg.action === "liveUpdate" || msg.action === "lookup") && msg.code) {
    if (dataLoaded) {
      showResult(msg.code);
    } else {
      pendingLookup = msg.code;
    }
  }

  if (msg.action === 'LOAD_SELECTED_CODE' && msg.code) {
    // Hide preview on manual selected code rendering
    const card = document.getElementById('claim-preview-card');
    if (card) card.style.display = 'none';
    
    if (dataLoaded) {
      showResult(msg.code);
    } else {
      pendingLookup = msg.code;
    }
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
  if (card) {
    card.className = 'card';
    card.style.display = '';
  }
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
  if (card) {
    card.className = 'card card-warning';
    card.style.display = '';
  }
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

// Telemetry Dashboard Sync Functions
function updateTelemetryUI() {
  try {
    window.ClaimAiTelemetry.getTelemetryPayload().then(data => {
      if (!data) return;

      const dashboard = document.getElementById('telemetry-dashboard');
      if (dashboard) {
        dashboard.style.display = data.consentGranted ? 'block' : 'none';
      }

      const toggle = document.getElementById('telemetry-toggle');
      if (toggle) {
        toggle.checked = data.consentGranted;
      }

      const validationsEl = document.getElementById('stats-validations');
      const lookupsEl = document.getElementById('stats-lookups');
      const timeEl = document.getElementById('stats-time');

      if (validationsEl) validationsEl.textContent = data.validations || 0;
      if (lookupsEl) lookupsEl.textContent = data.lookups || 0;
      if (timeEl) {
        const mins = Math.round((data.activeTimeMs || 0) / 60000);
        timeEl.textContent = `${mins}m`;
      }

      const payloadPre = document.getElementById('telemetry-payload-pre');
      if (payloadPre) {
        payloadPre.textContent = JSON.stringify(data, null, 2);
      }
    });
  } catch (e) {}
}

// Sync telemetry UI on storage updates (local aggregation changes)
try {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[window.ClaimAiTelemetry.TELEMETRY_KEY]) {
      updateTelemetryUI();
    }
  });
} catch (e) {}

