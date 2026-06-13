// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const statusText = document.getElementById('status-indicator');
  const lookupInput = document.getElementById('quick-lookup');
  const resultArea = document.getElementById('lookup-results');

  // Fetch active tab state to show page-specific coding metrics
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_METRICS' }, (response) => {
      if (statusText) {
        if (response && response.validCount !== undefined) {
          statusText.textContent = `Active: Validated ${response.validCount} code(s) on this page.`;
        } else {
          statusText.textContent = 'Inactive: Open a medical billing form to start.';
        }
      }
    });
  } catch (e) {
    if (statusText) statusText.textContent = 'Inactive: Unable to query tab.';
  }

  // Quick lookup implementation using background worker (guard elements)
  if (lookupInput) {
    lookupInput.addEventListener('input', (e) => {
      const query = (e.target.value || '').trim().toUpperCase();
      if (query.length >= 3) {
        chrome.runtime.sendMessage({ action: 'QUICK_LOOKUP', code: query }, (res) => {
          if (resultArea) {
            if (res && res.data) {
              resultArea.innerText = `${res.data.code} - ${res.data.description || res.data.d || 'No description'}`;
            } else {
              resultArea.innerText = 'No matching South African ICD-10 code found.';
            }
          }
        });
      } else if (resultArea) {
        resultArea.innerText = '';
      }
    });
  }
});
// Popup script for handling interactions in the action popup
console.log('ClaimAi Popup script loaded');
