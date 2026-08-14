// AI Export Assistant - Word Export
// Generates a Word-compatible HTML document from conversation messages

(function () {
  'use strict';

  window.AIExport = window.AIExport || {};

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  const WORD_TEMPLATES = {
    simple: {
      css: `
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333; font-size: 13px; }
  h1 { font-size: 20px; font-weight: 600; margin-bottom: 16px; }
  .meta { color: #888; font-size: 11px; margin-bottom: 16px; }
  .msg { margin-bottom: 10px; padding: 8px 12px; border-radius: 4px; }
  .msg-user { background: #f5f5f5; }
  .msg-assistant { background: #e8f0fe; }
  .role-label { font-weight: 600; font-size: 10px; text-transform: uppercase; margin-bottom: 4px; }
  .role-user { color: #333; }
  .role-assistant { color: #1a73e8; }
  .content { line-height: 1.5; white-space: pre-wrap; }
  code { background: #f0f0f0; padding: 1px 3px; border-radius: 2px; font-size: 12px; }
  pre { background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 12px; }`
    },
    detailed: {
      css: `
  body { font-family: -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #1d1d1f; }
  h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .meta { color: #6e6e73; font-size: 13px; margin-bottom: 24px; }
  .meta p { margin: 2px 0; }
  hr { border: none; border-top: 1px solid #d2d2d7; margin: 20px 0; }
  .msg { margin-bottom: 16px; padding: 12px 16px; border-radius: 8px; }
  .msg-user { background: #f5f5f7; }
  .msg-assistant { background: #e8f0fe; }
  .role-label { font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .role-user { color: #1d1d1f; }
  .role-assistant { color: #0071e3; }
  .content { line-height: 1.6; white-space: pre-wrap; font-size: 14px; }
  code { background: #f0f0f0; padding: 1px 4px; border-radius: 3px; font-size: 13px; }
  pre { background: #f5f5f7; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 13px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #d2d2d7; padding: 8px 12px; text-align: left; }
  th { background: #f5f5f7; font-weight: 600; }`
    },
    // Code-friendly: monospace, minimal, clean
    code: {
      css: `
  body { font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; max-width: 900px; margin: 0 auto; padding: 20px; color: #333; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #666; }
  .meta { color: #999; font-size: 10px; margin-bottom: 16px; }
  hr { border: none; border-top: 1px dashed #ddd; margin: 12px 0; }
  .msg { margin-bottom: 8px; padding: 4px 0; }
  .role-label { font-weight: 600; color: #1a73e8; font-size: 11px; }
  .role-user { color: #333; }
  .role-assistant { color: #1a73e8; }
  .content { line-height: 1.5; white-space: pre-wrap; }
  code { background: #f5f5f5; padding: 1px 3px; border-radius: 2px; }
  pre { background: #f5f5f5; padding: 8px; border-radius: 4px; }`
    }
  };

  /**
   * Convert messages to Word-compatible HTML
   * @param {Array} messages - Array of {role, content}
   * @param {string} platform - Platform name
   * @param {string} template - 'simple', 'detailed', 'code'
   */
  window.AIExport.toWordHTML = function (messages, platform, template) {
    template = template || 'detailed';
    const tpl = WORD_TEMPLATES[template] || WORD_TEMPLATES.detailed;

    let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>AI Conversation Export</title>
<style>${tpl.css}
</style>
</head>
<body>
<h1>AI Conversation Export</h1>
<div class="meta">
  <p>Platform: ${escapeHtml(platform || 'Unknown')} &middot; ${messages.length} messages &middot; ${new Date().toLocaleDateString()}</p>
</div>
<hr>`;

    for (const m of messages) {
      const role = m.role === 'user' ? 'user' : 'assistant';
      const roleLabel = m.role === 'user' ? 'You' : 'AI';
      const content = escapeHtml(m.content)
        .replace(/\n/g, '<br>')
        .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
      html += `<div class="msg msg-${role}">
  <div class="role-label role-${role}">${roleLabel}</div>
  <div class="content">${content}</div>
</div>`;
    }

    html += `\n</body>\n</html>`;
    return html;
  };

  /**
   * Download as Word (.doc)
   */
  window.AIExport.downloadAsWord = function (messages, platform, template) {
    const html = window.AIExport.toWordHTML(messages, platform, template);
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const filename = `ai-conversation-${Date.now()}.doc`;

    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };
})();