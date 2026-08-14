// AI Export Assistant - Background Service Worker

// ---- Install / Update ----
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Initialize storage
    chrome.storage.local.set({
      exportCount: 0,
      licenseKey: null,
      licenseVerified: false,
      installDate: Date.now(),
      showWelcome: true
    });
    console.log('[AI Export] Installed. Welcome!');
    // Open welcome page
    chrome.tabs.create({ url: 'welcome/welcome.html' });
  } else if (details.reason === 'update') {
    console.log('[AI Export] Updated to', chrome.runtime.getManifest().version);
  }
});

// ---- Keyboard shortcuts ----
chrome.commands.onCommand.addListener(async (command) => {
  console.log('[AI Export] Command:', command);
  if (command === 'export-markdown') {
    // Quick export: find active tab, extract, download
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js']
      });
      // Give it a moment, then inject quick-export
      setTimeout(async () => {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (platform) => {
            // Quick export: extract and download
            if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
              chrome.runtime.sendMessage({ action: 'extract-messages' }, (response) => {
                if (response?.success) {
                  // Create markdown
                  let md = '# AI Conversation Export\n\n';
                  response.messages.forEach(m => {
                    md += `### ${m.role === 'user' ? 'You' : 'AI'}\n\n${m.content}\n\n---\n\n`;
                  });
                  // Download
                  const blob = new Blob([md], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ai-conversation-${Date.now()}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              });
            }
          }
        });
      }, 500);
    } catch (e) {
      console.warn('[AI Export] Quick export failed:', e);
    }
  }
});

// ---- License verification ----
// Uses Gumroad's public License Verify API (no seller token needed).
// Docs: https://gumroad.com/api#licenses
async function verifyLicense(key) {
  const productId = 'AsGOrOJwjazTMpRSf3I4JA=='; // Gumroad product ID
  const verifyUrl = 'https://api.gumroad.com/v2/licenses/verify';

  try {
    const body = new URLSearchParams();
    body.append('product_id', productId);
    body.append('license_key', key.trim());

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    if (response.status === 404) {
      return { success: false, error: 'Invalid license key.' };
    }
    if (!response.ok) {
      return { success: false, error: `Gumroad error (HTTP ${response.status}). Please try again.` };
    }

    const data = await response.json();

    if (data && data.success) {
      await chrome.storage.local.set({
        licenseKey: key.trim(),
        licenseVerified: true,
        licenseEmail: data.purchase?.email || null,
        licenseProductName: data.purchase?.product_name || null,
        licenseVerifiedAt: Date.now()
      });
      return { success: true };
    } else {
      return { success: false, error: data.message || 'Invalid license key.' };
    }
  } catch (err) {
    // Offline fallback: check cached license
    const stored = await chrome.storage.local.get(['licenseKey']);
    if (stored.licenseKey && stored.licenseKey === key.trim()) {
      return { success: true, offline: true };
    }
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

// ---- Deactivate license ----
// Gumroad licenses stay valid server-side; deactivation just clears
// the stored key on this device.
async function deactivateLicense() {
  await chrome.storage.local.set({
    licenseKey: null,
    licenseVerified: false,
    licenseEmail: null,
    licenseProductName: null,
    licenseVerifiedAt: null
  });
}

// ---- Message handlers ----
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'verify-license':
      verifyLicense(request.licenseKey).then(sendResponse);
      return true; // Keep channel open

    case 'deactivate-license':
      deactivateLicense().then(sendResponse);
      return true;

    case 'get-license-status':
      chrome.storage.local.get(['licenseKey', 'licenseVerified', 'exportCount']).then((result) => {
        sendResponse({
          licensed: !!result.licenseKey && result.licenseVerified,
          exportCount: result.exportCount || 0
        });
      });
      return true;

    case 'manual-selection-result':
      // Redirect to popup if open, otherwise open a new tab
      console.log('[AI Export] Manual selection finished:', request.messages?.length, 'messages');
      // Store in local so popup can pick it up
      chrome.storage.local.set({
        manualSelection: {
          messages: request.messages,
          platform: request.platform,
          timestamp: Date.now()
        }
      });
      sendResponse({ success: true });
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Listen for when popup re-opens after manual selection
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.manualSelection) {
    console.log('[AI Export] Manual selection data available');
  }
});