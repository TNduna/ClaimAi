// content.js

let lastFocusedElement = null;
let debounceTimer = null;

console.log('%cClaimAi Content Script Loaded ✅', 'color: #10b981; font-weight: bold');

// Track active element focus
document.addEventListener('focusin', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
        lastFocusedElement = e.target;
    }
});

// Real-time input validation listener
document.addEventListener('input', (event) => {
    const target = event.target;
    if (!target || !(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
    }

    const text = target.isContentEditable ? target.textContent : target.value;
    const icdRegex = /\b[A-Z0-9][0-9]{2}(?:\.[0-9]{1,4})?\b/gi;
    const matches = text ? text.match(icdRegex) : null;

    if (matches && matches.length > 0) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            validateCodesOnPage(target, matches);
        }, 300);
    } else {
        removeBadges(target);
        validateCodesOnPage(target, []);
    }
});

/**
 * Delegates validation directly to background service worker (isolated origin)
 */
function validateCodesOnPage(element, codes) {
    chrome.runtime.sendMessage({ action: 'VALIDATE_CODES', codes: codes }, (response) => {
        if (chrome.runtime.lastError) {
            console.warn('ClaimAi: Validation communication pending background wake-up.', chrome.runtime.lastError);
            return;
        }
        if (response && response.results) {
            updateVisualBadges(element, response.results);
        }
    });
}

function updateVisualBadges(element, validationResults) {
    removeBadges(element);

    const container = document.createElement('div');
    container.className = 'claimai-badge-container';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '6px';
    container.style.marginTop = '6px';
    container.style.position = 'relative';

    validationResults.forEach(result => {
            const badge = document.createElement('span');
            // Use CSS-friendly class names expected by inject.css
            const baseCls = 'claimai-badge';
            const stateCls = result.isValid ? 'valid' : 'invalid';
            badge.className = `${baseCls} ${stateCls} show` + (result.pmbEligible ? ' pmb' : '');
        if (result.isValid) {
            if (result.pmbEligible) {
                badge.textContent = `${result.raw} (PMB)`;
            } else {
                badge.textContent = `${result.raw} (Valid)`;
            }
            badge.title = result.description || 'Valid South African ICD-10 code.';
        } else {
            const clean = (result.raw || '').replace(/[^A-Z0-9]/gi, '');
            if (clean.length === 3) {
                badge.className = `${baseCls} invalid show`;
                badge.style.backgroundColor = '#1e40af';
                badge.style.borderColor = '#3b82f6';
                badge.textContent = `${result.raw} (Category)`;
                badge.title = 'Incomplete ICD-10 Category Code.';
            } else {
                badge.textContent = `${result.raw} (Invalid)`;
                badge.title = 'Unrecognized South African ICD-10 Code.';
            }
        }

        container.appendChild(badge);
    });

    if (element.nextSibling) {
        element.parentNode.insertBefore(container, element.nextSibling);
    } else if (element.parentNode) {
        element.parentNode.appendChild(container);
    }
}

function removeBadges(element) {
    const parent = element.parentNode;
    if (!parent) return;
    const existing = parent.querySelector('.claimai-badge-container');
    if (existing) {
        existing.remove();
    }
}

// Global Chrome Message Router
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'INJECT_CODE') {
        const target = lastFocusedElement || document.activeElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            const currentVal = (target.value || '').trim();
            target.value = currentVal ? `${currentVal} / ${message.code}` : message.code;
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, reason: 'NO_ACTIVE_INPUT' });
        }
    }

    if (message.action === 'GET_PAGE_METRICS') {
        const valid = document.querySelectorAll('.claimai-badge.valid, .claimai-badge.pmb').length;
        sendResponse({ validCount: valid });
    }
});
