// AI Export Assistant - Popup Script

(function () {
  'use strict';

  // ---- State ----
  let currentMessages = [];
  let currentPlatform = '';

  // ---- DOM refs ----
  const $ = (id) => document.getElementById(id);
  const loadingEl = $('loading');
  const errorEl = $('error');
  const successEl = $('success');
  const errorMsg = $('error-message');
  const retryBtn = $('retry-btn');
  const platformName = $('platform-name');
  const platformIcon = $('platform-icon');
  const msgCount = $('msg-count');
  const previewContent = $('preview-content');
  const copyBtn = $('copy-btn');
  const trialInfo = $('trial-info');
  const unlockBtn = $('unlock-btn');
  const exportBtns = document.querySelectorAll('.btn-export');

  const PLATFORM_ICONS = {
    'chatgpt.com': '🤖', 'chat.openai.com': '🤖',
    'claude.ai': '🟣',
    'chat.deepseek.com': '🔵',
    'gemini.google.com': '✨'
  };

  const PLATFORM_NAMES = {
    'chatgpt.com': 'ChatGPT', 'chat.openai.com': 'ChatGPT',
    'claude.ai': 'Claude',
    'chat.deepseek.com': 'DeepSeek',
    'gemini.google.com': 'Gemini'
  };

  const SUPPORTED_DOMAINS = [
    'chatgpt.com', 'chat.openai.com', 'claude.ai',
    'chat.deepseek.com', 'gemini.google.com'
  ];

  // ---- Init ----
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    // Check for manual selection data first
    const stored = await chrome.storage.local.get(['manualSelection']);
    if (stored.manualSelection && stored.manualSelection.messages?.length > 0) {
      const { messages, platform } = stored.manualSelection;
      await chrome.storage.local.remove('manualSelection');
      currentMessages = messages;
      currentPlatform = platform || 'manual';
      platformIcon.textContent = '✋';
      platformName.textContent = 'Manual Selection';
      msgCount.textContent = messages.length;
      renderPreview(messages);
      await updateLicenseInfo();
      showState('success');
      return;
    }

    showState('loading');
    await extractMessages();
  }

  function showState(state) {
    loadingEl.style.display = state === 'loading' ? 'block' : 'none';
    errorEl.style.display = state === 'error' ? 'block' : 'none';
    successEl.style.display = state === 'success' ? 'block' : 'none';
  }

  // ---- Extract messages from page ----
  async function injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content/content.js']
      });
      // Wait a moment for the script to initialize
      await new Promise(r => setTimeout(r, 200));
      return true;
    } catch (err) {
      console.warn('[AI Export] Inject failed:', err);
      return false;
    }
  }

  async function extractMessages() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) { showError('No active tab found.'); return; }

      const url = tab.url || '';

      // Try to send message to existing content script
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'extract-messages' });
      } catch (e) {
        // Content script not loaded yet, inject it
        const injected = await injectContentScript(tab.id);
        if (!injected) {
          showError('Could not load content script. Try refreshing the page.');
          return;
        }
        // Try again
        try {
          response = await chrome.tabs.sendMessage(tab.id, { action: 'extract-messages' });
        } catch (e2) {
          showError('Please refresh the page and try again.');
          return;
        }
      }

      if (!response || !response.success) {
        showError(response?.error || 'Could not extract messages.');
        return;
      }

      currentMessages = response.messages;
      currentPlatform = response.platform;

      const host = new URL(url).hostname;
      platformIcon.textContent = PLATFORM_ICONS[host] || '🤖';
      platformName.textContent = PLATFORM_NAMES[host] || host;
      msgCount.textContent = currentMessages.length;

      renderPreview(currentMessages);
      await updateLicenseInfo();
      showState('success');

    } catch (err) {
      if (err.message?.includes('Could not establish connection')) {
        showError('Please refresh the page and try again.\n(Content script not loaded)');
      } else {
        showError(err.message || 'Unexpected error.');
      }
    }
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    showState('error');
  }

  // ---- Preview ----
  function renderPreview(messages) {
    const maxPreview = Math.min(messages.length, 6);
    let html = '';
    for (let i = 0; i < maxPreview; i++) {
      const m = messages[i];
      const roleLabel = m.role === 'user' ? 'You' : (m.role === 'assistant' ? 'AI' : m.role);
      const content = m.content.substring(0, 120);
      html += `<div class="msg">
        <div class="msg-role">${roleLabel}</div>
        <div class="msg-content">${escapeHtml(content)}</div>
      </div>`;
    }
    if (messages.length > maxPreview) {
      html += `<div class="msg" style="color:var(--text-secondary);font-style:italic;">... and ${messages.length - maxPreview} more messages</div>`;
    }
    previewContent.innerHTML = html;
  }

  function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  // ---- License / Trial ----
  async function updateLicenseInfo() {
    const status = await window.AIExport.getLicenseStatus();
    if (status.licensed) {
      trialInfo.textContent = '🔓 Full version activated';
      unlockBtn.textContent = 'Manage License';
    } else {
      trialInfo.textContent = `⚡ Free: ${status.remaining}/${status.maxFree} exports remaining`;
      unlockBtn.textContent = '🔓 Unlock Full ($9.9) →';
    }
  }

  // ---- Export ----
  function getSelectedTemplate() {
    const el = document.getElementById('template-select');
    return el ? el.value : 'detailed';
  }

  async function doExport(format) {
    const canExport = await window.AIExport.canExport();
    if (!canExport.canExport) {
      showToast('⚠️ Free limit reached. Unlock full version to export more.');
      return;
    }

    // Get platform name for file headers
    const host = currentPlatform ? new URL('https://' + currentPlatform).hostname : '';
    const platformName = PLATFORM_NAMES[host] || currentPlatform || 'AI';
    const template = getSelectedTemplate();

    switch (format) {
      case 'markdown': {
        const md = window.AIExport.toMarkdown(currentMessages, platformName, template);
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
          url: url,
          filename: `ai-conversation-${Date.now()}.md`,
          saveAs: true
        });
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        break;
      }
      case 'word': {
        window.AIExport.downloadAsWord(currentMessages, platformName, template);
        break;
      }
      case 'pdf': {
        window.AIExport.downloadAsPDF(currentMessages, platformName, template);
        break;
      }
    }

    // Increment count for free users
    const status = await window.AIExport.getLicenseStatus();
    if (!status.licensed) {
      await window.AIExport.incrementExportCount();
      await updateLicenseInfo();
    }

    showToast('✅ Exported!');
  }

  // ---- Copy ----
  async function doCopy() {
    const host = currentPlatform ? new URL('https://' + currentPlatform).hostname : '';
    const platformName = PLATFORM_NAMES[host] || currentPlatform || 'AI';
    const template = getSelectedTemplate();
    await window.AIExport.copyAsMarkdown(currentMessages, platformName, template);
    showToast('📋 Copied!');
  }

  // ---- Toast ----
  function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // ---- Events ----
  retryBtn.addEventListener('click', () => {
    showState('loading');
    setTimeout(extractMessages, 300);
  });

  // ---- Manual Select ----
  const manualBtn = $('manual-btn');
  manualBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'start-manual-select' });
      window.close(); // Close popup, user picks on page
    } catch (err) {
      showToast('⚠️ Please refresh the page first.');
    }
  });

  // ---- Debug ----
  const debugBtn = $('debug-btn');
  debugBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'debug-info' });
      if (response.success) {
        const info = [
          `Platform: ${response.platform}`,
          `Messages found: ${response.messageCount}`,
          `Page: ${response.domInfo.title}`,
          `URL: ${response.domInfo.url}`,
          `Body size: ${response.domInfo.bodySize} chars`,
          `Links: ${response.domInfo.linkCount}`,
          '',
          '--- First 3 messages preview ---',
          ...response.messages.map((m, i) => `[${m.role}]: ${m.content.substring(0, 80)}...`)
        ].join('\n');
        console.log('[AI Export Debug]', info);
        showToast('🔍 Check console (F12) for debug info');
      } else {
        showToast('⚠️ Content script not responding.');
      }
    } catch (err) {
      showToast('⚠️ Debug failed. Refresh page?');
    }
  });

  copyBtn.addEventListener('click', doCopy);

  exportBtns.forEach(btn => {
    btn.addEventListener('click', () => doExport(btn.dataset.format));
  });

  unlockBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
})();