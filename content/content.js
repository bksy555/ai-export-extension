// AI Export Assistant - Content Script
// Extracts conversation messages from AI chat platforms

(function () {
  'use strict';

  const DEBUG = true;
  function log(...args) {
    if (DEBUG) console.log('[AI Export]', ...args);
  }

  // ============================================================
  // SECTION 1: Platform-specific extractors
  // ============================================================

  const EXTRACTORS = {

    // ---- ChatGPT ----
    chatgpt: function () {
      const turns = document.querySelectorAll('[data-testid^="conversation-turn-"]');
      if (turns.length > 0) {
        return Array.from(turns).map(el => {
          const role = el.getAttribute('data-message-author-role') === 'user' ? 'user' : 'assistant';
          const contentEl = el.querySelector('div[data-message-author-role]');
          return { role, content: contentEl?.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      const articles = document.querySelectorAll('article');
      if (articles.length > 0) {
        return Array.from(articles).map(el => {
          const isUser = el.matches('[data-testid="user-message"], [data-message-author-role="user"]');
          return { role: isUser ? 'user' : 'assistant', content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      return null;
    },

    // ---- Claude ----
    claude: function () {
      const groups = document.querySelectorAll('[data-testid="message-group"], .message-group');
      if (groups.length > 0) {
        return Array.from(groups).map(el => {
          const isUser = el.querySelector('[data-testid="user-message"], .user-message, .message-user');
          return { role: isUser ? 'user' : 'assistant', content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      const fontEls = document.querySelectorAll('.font-cursor, .font-claude, .message-content, [class*="message"]');
      if (fontEls.length > 0) {
        return Array.from(fontEls).map(el => {
          const isUser = el.closest('[class*="user"]') || el.closest('[data-role="user"]');
          return { role: isUser ? 'user' : 'assistant', content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      return null;
    },

    // ---- DeepSeek ----
    deepseek: function () {
      const msgs = document.querySelectorAll('[class*="chat-message"], [class*="message-container"], [data-role]');
      if (msgs.length > 0) {
        return Array.from(msgs).map(el => {
          const role = el.getAttribute('data-role') === 'user' ? 'user' : 'assistant';
          return { role, content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      return null;
    },

    // ---- Gemini ----
    gemini: function () {
      const items = document.querySelectorAll('[class*="conversation"], [data-test-id*="message"], [role="presentation"]');
      if (items.length > 0) {
        return Array.from(items).map(el => {
          const isUser = el.querySelector('[class*="user"], [data-role="user"]') || el.closest('[class*="user"]');
          const content = el.innerText?.trim() || '';
          return { role: isUser ? 'user' : 'assistant', content };
        }).filter(m => m.content);
      }
      const texts = document.querySelectorAll('.query-text, .response-text, .text-result, [class*="text-"]');
      if (texts.length > 0) {
        return Array.from(texts).map(el => {
          const isUser = el.classList.contains('query-text') || el.closest('[class*="query"]');
          return { role: isUser ? 'user' : 'assistant', content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      return null;
    },

    // ---- 通义千问 (tongyi.aliyun.com / qianwen.aliyun.com) ----
    tongyi: function () {
      const msgs = document.querySelectorAll('[class*="chat-message"], [class*="message-item"], [data-role="user"], [data-role="assistant"]');
      if (msgs.length > 0) {
        return Array.from(msgs).map(el => {
          const role = el.getAttribute('data-role') === 'user' ? 'user' : 'assistant';
          return { role, content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      // 通义对话气泡
      const bubbles = document.querySelectorAll('.chat-bubble, .bubble, [class*="bubble-"]');
      if (bubbles.length > 0) {
        return Array.from(bubbles).map(el => {
          const isUser = el.closest('[class*="user"], [class*="right"]') || el.matches('[class*="user"]');
          return { role: isUser ? 'user' : 'assistant', content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      return null;
    },

    // ---- Kimi (kimi.moonshot.cn) ----
    kimi: function () {
      const msgs = document.querySelectorAll('[class*="chat-item"], [class*="message-item"], [data-role]');
      if (msgs.length > 0) {
        return Array.from(msgs).map(el => {
          const role = el.getAttribute('data-role') === 'user' ? 'user' : 'assistant';
          return { role, content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      // Kimi 对话结构
      const items = document.querySelectorAll('.conversation-item, .message-block, [class*="msg-"]');
      if (items.length > 0) {
        return Array.from(items).map(el => {
          const isUser = el.closest('[class*="user"], [data-side="user"]') || el.matches('[class*="user"]');
          return { role: isUser ? 'user' : 'assistant', content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      return null;
    },

    // ---- 豆包 (doubao.com) ----
    doubao: function () {
      const msgs = document.querySelectorAll('[class*="message"], [class*="chat-msg"], [data-role]');
      if (msgs.length > 0) {
        return Array.from(msgs).map(el => {
          const role = el.getAttribute('data-role') === 'user' ? 'user' : 'assistant';
          return { role, content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      return null;
    },

    // ---- 文心一言 (yiyan.baidu.com) ----
    wenxin: function () {
      const msgs = document.querySelectorAll('[class*="message"], [class*="chat-item"], [class*="dialog-"]');
      if (msgs.length > 0) {
        return Array.from(msgs).map(el => {
          const isUser = el.closest('[class*="user"], [class*="self"]') || el.matches('[class*="user"], [class*="self"]');
          return { role: isUser ? 'user' : 'assistant', content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      // 文心一言的问答结构
      const qa = document.querySelectorAll('.question, .answer, [class*="qa-"]');
      if (qa.length > 0) {
        return Array.from(qa).map(el => {
          const isUser = el.matches('.question, [class*="question"]');
          return { role: isUser ? 'user' : 'assistant', content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      return null;
    },

    // ---- Perplexity ----
    perplexity: function () {
      const msgs = document.querySelectorAll('[class*="message"], [data-role]');
      if (msgs.length > 0) {
        return Array.from(msgs).map(el => {
          const role = el.getAttribute('data-role') === 'user' ? 'user' : 'assistant';
          return { role, content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      // Perplexity thread items
      const items = document.querySelectorAll('[class*="thread"], [class*="conversation"] li, [class*="response"]');
      if (items.length > 0) {
        return Array.from(items).map(el => {
          const isUser = !!el.querySelector('[class*="user"], [class*="query"]');
          return { role: isUser ? 'user' : 'assistant', content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      return null;
    },

    // ---- Universal fallback ----
    universal: function () {
      const candidates = document.querySelectorAll([
        '[role="user"], [role="assistant"],',
        '[data-role="user"], [data-role="assistant"],',
        '[class*="user-message"], [class*="assistant-message"],',
        '[class*="message-user"], [class*="message-assistant"],',
        '.user, .assistant',
        'article'
      ].join(', '));
      if (candidates.length > 0) {
        return Array.from(candidates).map(el => {
          const role = el.matches('[role="user"], [data-role="user"], [class*="user"], .user') ? 'user' : 'assistant';
          return { role, content: el.innerText?.trim() || '' };
        }).filter(m => m.content);
      }
      return null;
    }
  };

  // ============================================================
  // SECTION 2: Platform detection
  // ============================================================

  function detectPlatform() {
    const host = window.location.hostname;
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) return 'chatgpt.com';
    if (host.includes('claude.ai')) return 'claude.ai';
    if (host.includes('chat.deepseek.com')) return 'chat.deepseek.com';
    if (host.includes('gemini.google.com')) return 'gemini.google.com';
    if (host.includes('tongyi.aliyun.com') || host.includes('qianwen.aliyun.com') || host.includes('aliyun.com')) return 'tongyi.aliyun.com';
    if (host.includes('kimi.moonshot.cn') || host.includes('kimi.com')) return 'kimi.moonshot.cn';
    if (host.includes('doubao.com') || host.includes('doubao')) return 'doubao.com';
    if (host.includes('yiyan.baidu.com')) return 'yiyan.baidu.com';
    if (host.includes('perplexity')) return 'perplexity.ai';
    return host;
  }

  const PLATFORM_MAP = {
    'chatgpt.com': ['chatgpt'],
    'claude.ai': ['claude'],
    'chat.deepseek.com': ['deepseek'],
    'gemini.google.com': ['gemini'],
    'tongyi.aliyun.com': ['tongyi', 'universal'],
    'qianwen.aliyun.com': ['tongyi', 'universal'],
    'kimi.moonshot.cn': ['kimi', 'universal'],
    'doubao.com': ['doubao', 'universal'],
    'yiyan.baidu.com': ['wenxin', 'universal'],
    'perplexity.ai': ['perplexity', 'universal']
  };

  // ============================================================
  // SECTION 3: Main extraction
  // ============================================================

  function extractMessages() {
    const platform = detectPlatform();
    log('Platform detected:', platform);

    // 1. Try platform-specific extractors
    const extractorNames = PLATFORM_MAP[platform];
    if (extractorNames) {
      for (const name of extractorNames) {
        const result = EXTRACTORS[name]();
        if (result && result.length > 0) {
          log(`Extracted ${result.length} messages via ${name}`);
          return { messages: result, platform };
        }
      }
    }

    // 2. Try all extractors in order
    const allNames = ['chatgpt', 'claude', 'deepseek', 'gemini', 'tongyi', 'kimi', 'doubao', 'wenxin', 'perplexity', 'universal'];
    for (const name of allNames) {
      const result = EXTRACTORS[name]();
      if (result && result.length > 0) {
        log(`Extracted ${result.length} messages via ${name} (fallback)`);
        return { messages: result, platform };
      }
    }

    log('No messages found');
    return { messages: [], platform };
  }

  // ============================================================
  // SECTION 4: Manual selection mode
  // ============================================================

  let selectionModeActive = false;
  let selectedElements = [];
  let overlayContainer = null;

  function createOverlay() {
    if (overlayContainer) return;
    overlayContainer = document.createElement('div');
    overlayContainer.id = 'ai-export-overlay';
    overlayContainer.innerHTML = `
      <style>
        #ai-export-overlay { position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none; }
        #ai-export-overlay * { pointer-events: auto; }
        .ai-export-toolbar {
          position: fixed; top: 12px; right: 12px; z-index: 2147483647;
          display: flex; gap: 6px; padding: 8px 12px;
          background: #fff; border-radius: 10px; box-shadow: 0 2px 16px rgba(0,0,0,0.15);
          font-family: -apple-system, 'Segoe UI', Arial, sans-serif; font-size: 13px;
        }
        .ai-export-toolbar button {
          border: none; border-radius: 6px; padding: 6px 14px; cursor: pointer;
          font-size: 12px; font-weight: 500; transition: all 0.15s;
        }
        .ai-export-btn-pick { background: #0071e3; color: #fff; }
        .ai-export-btn-pick:hover { background: #0062c4; }
        .ai-export-btn-pick.active { background: #ff3b30; }
        .ai-export-btn-done { background: #34c759; color: #fff; }
        .ai-export-btn-done:hover { background: #2db84e; }
        .ai-export-btn-cancel { background: #f0f0f0; color: #1d1d1f; }
        .ai-export-btn-cancel:hover { background: #e0e0e0; }
        .ai-export-hl { outline: 3px solid #0071e3 !important; outline-offset: 2px !important; background: rgba(0,113,227,0.05) !important; }
        .ai-export-hl-selected { outline: 3px solid #34c759 !important; outline-offset: 2px !important; background: rgba(52,199,89,0.08) !important; }
      </style>
      <div class="ai-export-toolbar" id="ai-export-toolbar">
        <span style="font-weight:600;color:#1d1d1f;padding:6px 4px;">📄 AI Export</span>
        <button id="ai-export-pick-btn" class="ai-export-btn-pick">✋ Pick</button>
        <button id="ai-export-done-btn" class="ai-export-btn-done" disabled>✅ Done (0)</button>
        <button id="ai-export-cancel-btn" class="ai-export-btn-cancel">✕ Cancel</button>
      </div>
    `;
    document.body.appendChild(overlayContainer);

    // ---- Event handlers ----
    document.getElementById('ai-export-pick-btn').addEventListener('click', togglePickMode);
    document.getElementById('ai-export-done-btn').addEventListener('click', finishSelection);
    document.getElementById('ai-export-cancel-btn').addEventListener('click', cancelSelection);
  }

  function togglePickMode() {
    selectionModeActive = !selectionModeActive;
    const btn = document.getElementById('ai-export-pick-btn');
    btn.textContent = selectionModeActive ? '✋ Active' : '✋ Pick';
    btn.classList.toggle('active', selectionModeActive);
    document.body.style.cursor = selectionModeActive ? 'crosshair' : '';
    log('Selection mode:', selectionModeActive ? 'ON' : 'OFF');
  }

  function handleMouseOver(e) {
    if (!selectionModeActive) return;
    const target = e.target.closest('article, [class*="message"], [class*="conversation"], [data-role], section, .chat-item');
    if (!target || target.closest('#ai-export-overlay')) return;
    document.querySelectorAll('.ai-export-hl').forEach(el => el.classList.remove('ai-export-hl'));
    target.classList.add('ai-export-hl');
  }

  function handleClick(e) {
    if (!selectionModeActive) return;
    e.preventDefault();
    e.stopPropagation();
    const target = e.target.closest('article, [class*="message"], [class*="conversation"], [data-role], section, .chat-item');
    if (!target || target.closest('#ai-export-overlay')) return;

    const idx = selectedElements.indexOf(target);
    if (idx >= 0) {
      target.classList.remove('ai-export-hl-selected');
      selectedElements.splice(idx, 1);
    } else {
      target.classList.add('ai-export-hl-selected');
      target.classList.remove('ai-export-hl');
      selectedElements.push(target);
    }
    document.getElementById('ai-export-done-btn').textContent = `✅ Done (${selectedElements.length})`;
    document.getElementById('ai-export-done-btn').disabled = selectedElements.length === 0;
    log('Selected:', selectedElements.length);
  }

  function finishSelection() {
    if (selectedElements.length === 0) return;
    const messages = selectedElements.map(el => {
      const isUser = el.matches('[role="user"], [data-role="user"], [class*="user"], .user, [class*="query"]');
      return { role: isUser ? 'user' : 'assistant', content: el.innerText?.trim() || '' };
    }).filter(m => m.content);
    log('Manual selection finished:', messages.length, 'messages');

    // Send to background for storage
    chrome.runtime.sendMessage({
      action: 'manual-selection-result',
      messages: messages,
      platform: detectPlatform()
    });

    // Show confirmation
    const toolbar = document.getElementById('ai-export-toolbar');
    if (toolbar) {
      toolbar.innerHTML = `<span style="font-weight:600;color:#34c759;padding:6px 4px;">✅ ${messages.length} messages selected! Click the plugin icon to export.</span>`;
    }

    cleanupSelection();
  }

  function cancelSelection() {
    cleanupSelection();
  }

  function cleanupSelection() {
    selectionModeActive = false;
    selectedElements = [];
    document.body.style.cursor = '';
    document.querySelectorAll('.ai-export-hl, .ai-export-hl-selected').forEach(el => {
      el.classList.remove('ai-export-hl', 'ai-export-hl-selected');
    });
    if (overlayContainer) {
      overlayContainer.remove();
      overlayContainer = null;
    }
  }

  // ============================================================
  // SECTION 5: Message listener
  // ============================================================

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    log('Message received:', request.action);

    if (request.action === 'extract-messages') {
      const result = extractMessages();
      if (result.messages.length === 0) {
        sendResponse({ success: false, error: 'No messages found on this page.' });
      } else {
        sendResponse({ success: true, ...result });
      }
    }

    if (request.action === 'start-manual-select') {
      createOverlay();
      sendResponse({ success: true });
    }

    if (request.action === 'debug-info') {
      const result = extractMessages();
      sendResponse({
        success: true,
        platform: result.platform,
        messageCount: result.messages.length,
        messages: result.messages.slice(0, 3),
        domInfo: {
          title: document.title,
          url: window.location.href,
          bodySize: document.body?.innerText?.length || 0,
          linkCount: document.querySelectorAll('a').length
        }
      });
    }

    return true;
  });

  log('Content script loaded on', window.location.hostname);
})();