// content.js
console.log('%cClaimAi Content Script Loaded ✅', 'color: #10b981; font-weight: bold');

let icd10Index = {};
let pmbIndex = {};

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
    if (index && index[variant]) return index[variant];
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

async function loadICDData() {
  try {
    const module = await import(chrome.runtime.getURL('lib/icd10-index.js'));
    icd10Index = module.icd10Index || module.default || {};
    const pmbRes = await fetch(chrome.runtime.getURL('rules/pmb-linkages.json'));
    pmbIndex = normalizeSourceIndex(await pmbRes.json());
    console.log(`✅ Real-time loaded ${Object.keys(icd10Index).length} ICD codes and ${Object.keys(pmbIndex).length} normalized PMB entries`);
  } catch (e) {
    console.error("Failed to load ICD or PMB data", e);
  }
}

class ClaimAiContent {
  constructor() {
    this.init();
  }

  async init() {
    await loadICDData();
    this.setupInputMonitoring();
  }

  setupInputMonitoring() {
    const selector = 'input, textarea, [contenteditable]:not([contenteditable="false"])';
    const attach = (element) => {
      if (element.dataset.claimaiAttached) return;
      element.dataset.claimaiAttached = true;

      element.addEventListener('input', (e) => this.handleInput(e));
      element.addEventListener('blur', () => this.removeBadge());
    };

    const observer = new MutationObserver(() => {
      document.querySelectorAll(selector).forEach(attach);
    });

    if (document.body) {
      document.querySelectorAll(selector).forEach(attach);
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      const rootObserver = new MutationObserver(() => {
        if (document.body) {
          document.querySelectorAll(selector).forEach(attach);
          observer.observe(document.body, { childList: true, subtree: true });
          rootObserver.disconnect();
        }
      });
      rootObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  handleInput(e) {
    const raw = e.target.value !== undefined ? e.target.value : e.target.textContent;
    const value = (raw || '').trim().toUpperCase();
    if (!/^[A-Z]\d{2}/.test(value)) return;

    this.removeBadge();

    let cleanCode = value.replace(/\s+/g, '');
    const icdMatch = lookupIndex(icd10Index, cleanCode);
    const pmbMatch = lookupIndex(pmbIndex, cleanCode);
    const validMatch = icdMatch || pmbMatch;

    if (validMatch) {
      if (pmbMatch && !icdMatch) {
        this.showPmbBadge(e.target, cleanCode);
      } else {
        this.showValidBadge(e.target, cleanCode);
      }

      chrome.runtime.sendMessage({
        action: "liveUpdate",
        code: cleanCode
      }, () => {
        if (chrome.runtime.lastError) {
          console.warn('ClaimAi liveUpdate message failed:', chrome.runtime.lastError.message);
        } else {
          console.log('ClaimAi liveUpdate sent:', cleanCode);
        }
      });
    } else if (value.length >= 4) {
      this.showInvalidBadge(e.target);
    }
  }

  showValidBadge(input, code) {
    const badge = document.createElement('div');
    badge.className = 'claimai-badge valid';
    badge.innerHTML = `<span class="badge-icon">✓</span><span>VALID: ${code}</span>`;
    this.placeBadge(badge, input);
    document.body.appendChild(badge);
    requestAnimationFrame(() => badge.classList.add('show'));
    setTimeout(() => {
      badge.classList.remove('show');
      setTimeout(() => badge.remove(), 180);
    }, 2500);
  }

  showInvalidBadge(input) {
    const badge = document.createElement('div');
    badge.className = 'claimai-badge invalid';
    badge.innerHTML = `<span class="badge-icon">✗</span><span>UNKNOWN CODE</span>`;
    this.placeBadge(badge, input);
    document.body.appendChild(badge);
    requestAnimationFrame(() => badge.classList.add('show'));
    setTimeout(() => {
      badge.classList.remove('show');
      setTimeout(() => badge.remove(), 180);
    }, 2200);
  }

  showPmbBadge(input, code) {
    const badge = document.createElement('div');
    badge.className = 'claimai-badge valid';
    badge.innerHTML = `<span class="badge-icon">🛡️</span><span>PMB ELIGIBLE: ${code}</span>`;
    this.placeBadge(badge, input);
    document.body.appendChild(badge);
    requestAnimationFrame(() => badge.classList.add('show'));
    setTimeout(() => {
      badge.classList.remove('show');
      setTimeout(() => badge.remove(), 180);
    }, 2800);
  }

  placeBadge(badge, input) {
    const rect = input.getBoundingClientRect();
    badge.style.top = `${Math.max(8, rect.top - 36)}px`;
    badge.style.left = `${Math.max(8, rect.left)}px`;
  }

  removeBadge() {
    document.querySelectorAll('.claimai-badge').forEach(b => b.remove());
  }
}

new ClaimAiContent();
