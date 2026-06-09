// background.js
console.log('%cClaimAi Background Service Worker Loaded ✅', 'color: #10b981; font-weight: bold');

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "claimai-lookup",
    title: "🔍 Lookup in ClaimAi",
    contexts: ["selection"]
  });
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

// Listen for messages from side panel or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getICDData") {
    // Optional: send data directly if needed
  }
});
