// content.js
console.log('%cClaimAi Content Script Loaded ✅', 'color: #10b981; font-weight: bold');

let icd10Index = {};
let pmbIndex = {};

async function loadData() {
  try {
    // Load ICD-10
    const icdRes = await fetch(chrome.runtime.getURL('ICD-10-CM/diagnosis_codes.json'));
    const icdData = await icdRes.json();

    // Load PMB
    const pmbRes = await fetch(chrome.runtime.getURL('rules/pmb-linkages.json'));
    pmbIndex = await pmbRes.json();

    // Build ICD index
    function traverse(node) {
      if (!node) return;
      let code = (node.code || node.icd_code || '').toString().trim().toUpperCase();
      if (code) icd10Index[code] = { d: node.desc_full || node.desc || "" };
      if (Array.isArray(node.children)) node.children.forEach(traverse);
    }
    icdData.forEach(traverse);

    console.log(`✅ Loaded ${Object.keys(icd10Index).length} ICD + ${Object.keys(pmbIndex).length} PMB`);
  } catch (e) {
    console.error("Load error:", e);
  }
}

class ClaimAiContent {
  constructor() {
    this.init();
  }

  async init() {
    await loadData();
    this.setupInputMonitoring();
  }

  setupInputMonitoring() {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('input, textarea').forEach(input => {
        if (input.dataset.claimaiAttached) return;
        input.dataset.claimaiAttached = true;

        input.addEventListener('input', (e) => this.handleInput(e));
        input.addEventListener('blur', () => this.removeBadge());
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  handleInput(e) {
    const value = e.target.value.trim().toUpperCase();
    if (!/^[A-Z]\d{2}/.test(value)) return;

    this.removeBadge();

    let cleanCode = value.replace(/\s+/g, '');
    const icdData = icd10Index[cleanCode] || 
                    icd10Index[cleanCode.replace('.', '')] ||
                    icd10Index[cleanCode.replace(/(\w{3})(\d)/, '$1.$2')];
    const isPMB = !!pmbIndex[cleanCode] || !!pmbIndex[cleanCode.replace('.', '')];

    if (icdData) {
      this.showValidBadge(e.target, cleanCode, isPMB);
      
      // Send live update to side panel if it's open
      try {
        chrome.runtime.sendMessage({
          action: "liveUpdate",
          code: cleanCode
        });
      } catch (e) {
        // Ignore - normal when extension is reloaded
        // console.log("Side panel not connected");
      }
    } else if (value.length >= 5) {
      this.showInvalidBadge(e.target);
    }
  }

  showValidBadge(input, code, isPMB) {
    const badge = document.createElement('div');
    badge.className = 'claimai-badge';
    
    if (isPMB) {
      badge.textContent = '🛡️ PMB';
      badge.style.background = '#10b981';
    } else {
      badge.textContent = '✓ VALID';
      badge.style.background = '#3b82f6';
    }

    badge.style.cssText += `
      position: fixed;
      color: white;
      font-size: 12px;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 2147483647;
      pointer-events: none;
      white-space: nowrap;
    `;

    const rect = input.getBoundingClientRect();
    badge.style.top = `${rect.top - 34}px`;
    badge.style.left = `${rect.left + 8}px`;

    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 2800);
  }

  showInvalidBadge(input) {
    const badge = document.createElement('div');
    badge.className = 'claimai-badge';
    badge.textContent = '✗ UNKNOWN';
    badge.style.cssText = `
      position: fixed;
      background: #ef4444;
      color: white;
      font-size: 12px;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 2147483647;
      pointer-events: none;
    `;

    const rect = input.getBoundingClientRect();
    badge.style.top = `${rect.top - 34}px`;
    badge.style.left = `${rect.left + 8}px`;

    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 2200);
  }

  removeBadge() {
    document.querySelectorAll('.claimai-badge').forEach(b => b.remove());
  }
}

// Start
new ClaimAiContent();
