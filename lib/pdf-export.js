// AI Export Assistant - PDF Export
// Generates a print-friendly HTML document for PDF export

(function () {
  'use strict';

  window.AIExport = window.AIExport || {};

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  const PDF_TEMPLATES = {
    simple: {
      css: `
  @page { margin: 15mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; color: #333; font-size: 11px; }
  h1 { font-size: 18px; font-weight: 600; margin-bottom: 2px; }
  .meta { color: #888; font-size: 10px; margin-bottom: 12px; }
  .msg { margin-bottom: 8px; padding: 6px 10px; border-radius: 3px; }
  .msg-user { background: #f5f5f5; }
  .msg-assistant { background: #e8f0fe; }
  .role-label { font-weight: 600; font-size: 9px; text-transform: uppercase; margin-bottom: 3px; }
  .role-user { color: #333; }
  .role-assistant { color: #1a73e8; }
  .content { line-height: 1.4; white-space: pre-wrap; }
  code { background: #f0f0f0; padding: 1px 2px; border-radius: 2px; font-size: 10px; }
  pre { background: #f5f5f5; padding: 6px; border-radius: 3px; font-size: 10px; }`
    },
    detailed: {
      css: `
  @page { margin: 20mm 15mm; }
  body { font-family: -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 0; color: #1d1d1f; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6e6e73; font-size: 11px; margin-bottom: 16px; }
  .meta p { margin: 1px 0; }
  hr { border: none; border-top: 0.5px solid #d2d2d7; margin: 12px 0; }
  .msg { margin-bottom: 10px; padding: 8px 12px; border-radius: 4px; }
  .msg-user { background: #f5f5f7; }
  .msg-assistant { background: #e8f0fe; }
  .role-label { font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; }
  .role-user { color: #1d1d1f; }
  .role-assistant { color: #0071e3; }
  .content { line-height: 1.5; white-space: pre-wrap; font-size: 12px; }
  code { background: #f0f0f0; padding: 1px 3px; border-radius: 2px; font-size: 11px; }
  pre { background: #f5f5f7; padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 11px; page-break-inside: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 11px; }
  th, td { border: 0.5px solid #d2d2d7; padding: 4px 8px; text-align: left; }
  th { background: #f5f5f7; font-weight: 600; }
  @media print { .msg { break-inside: avoid; } pre { break-inside: avoid; } }`
    },
    code: {
      css: `
  @page { margin: 12mm; }
  body { font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; max-width: 800px; margin: 0 auto; padding: 0; color: #333; font-size: 10px; }
  h1 { font-size: 14px; font-weight: 600; color: #666; margin-bottom: 8px; }
  .meta { color: #999; font-size: 9px; margin-bottom: 12px; }
  hr { border: none; border-top: 0.5px dashed #ddd; margin: 8px 0; }
  .msg { margin-bottom: 6px; }
  .role-label { font-weight: 600; color: #1a73e8; font-size: 10px; }
  .role-user { color: #333; }
  .role-assistant { color: #1a73e8; }
  .content { line-height: 1.4; white-space: pre-wrap; }
  code { background: #f5f5f5; padding: 1px 2px; border-radius: 2px; }`
    }
  };

  /**
   * Generate a print-optimized HTML page for PDF export
   * @param {Array} messages - Array of {role, content}
   * @param {string} platform - Platform name
   * @param {string} template - 'simple', 'detailed', 'code'
   */
  window.AIExport.toPDFHTML = function (messages, platform, template) {
    template = template || 'detailed';
    const tpl = PDF_TEMPLATES[template] || PDF_TEMPLATES.detailed;

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
  <p>${escapeHtml(platform || 'Unknown')} · ${messages.length} messages · ${new Date().toLocaleDateString()}</p>
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
   * Open PDF in a new tab for printing/saving
   */
  window.AIExport.openPDF = function (messages, platform, template) {
    const html = window.AIExport.toPDFHTML(messages, platform, template);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    chrome.tabs.create({ url: url, active: true });
  };

  /**
   * Download as HTML file for PDF printing
   */
  window.AIExport.downloadAsPDF = function (messages, platform, template) {
    const html = window.AIExport.toPDFHTML(messages, platform, template);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const filename = `ai-conversation-${Date.now()}.html`;

    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };
})();