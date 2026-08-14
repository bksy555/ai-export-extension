// AI Export Assistant - Markdown Export
// Converts conversation messages to Markdown format with template support

(function () {
  'use strict';

  window.AIExport = window.AIExport || {};

  /**
   * Templates for markdown export
   */
  const TEMPLATES = {
    // Simple: minimal metadata, just the conversation
    simple: {
      header: function (messages, platform) {
        return `# 💬 AI Conversation\n\n> Exported from ${platform || 'AI'} · ${messages.length} messages\n\n`;
      },
      msg: function (m) {
        const roleLabel = m.role === 'user' ? '**You:**' : '**AI:**';
        return `${roleLabel}\n\n${m.content}\n\n`;
      },
      separator: '\n---\n'
    },

    // Detailed: full metadata, timestamp, platform info
    detailed: {
      header: function (messages, platform) {
        let md = '# AI Conversation Export\n\n';
        md += `- **Platform:** ${platform || 'Unknown'}\n`;
        md += `- **Date:** ${new Date().toISOString().split('T')[0]}\n`;
        md += `- **Messages:** ${messages.length}\n`;
        md += `- **Exported:** ${new Date().toLocaleString()}\n\n`;
        md += `---\n\n`;
        return md;
      },
      msg: function (m) {
        const roleLabel = m.role === 'user' ? 'You' : 'AI';
        const ts = m.timestamp ? ` *( ${new Date(m.timestamp).toLocaleTimeString()} )*` : '';
        return `### 👤 ${roleLabel}${ts}\n\n${m.content}\n\n`;
      },
      separator: '\n---\n'
    },

    // Code-friendly: compact, minimal formatting, easy to diff
    code: {
      header: function (messages, platform) {
        let md = `// AI Conversation\n`;
        md += `// Platform: ${platform || 'Unknown'}\n`;
        md += `// Date: ${new Date().toISOString().split('T')[0]}\n`;
        md += `// Messages: ${messages.length}\n\n`;
        return md;
      },
      msg: function (m) {
        const roleLabel = m.role === 'user' ? 'USER' : 'AI';
        return `/* ${roleLabel} */\n${m.content}\n\n`;
      },
      separator: '\n// ---\n'
    }
  };

  /**
   * Convert messages array to Markdown string
   * @param {Array} messages - Array of {role, content, timestamp}
   * @param {string} platform - Platform name
   * @param {string} template - Template name: 'simple', 'detailed', 'code'
   * @returns {string} Formatted Markdown
   */
  window.AIExport.toMarkdown = function (messages, platform, template) {
    template = template || 'detailed';
    const tpl = TEMPLATES[template] || TEMPLATES.detailed;

    let md = tpl.header(messages, platform);
    for (let i = 0; i < messages.length; i++) {
      md += tpl.msg(messages[i]);
      if (i < messages.length - 1) {
        md += tpl.separator;
      }
    }
    return md;
  };

  /**
   * Copy messages as Markdown to clipboard
   */
  window.AIExport.copyAsMarkdown = async function (messages, platform, template) {
    const md = window.AIExport.toMarkdown(messages, platform, template);
    await navigator.clipboard.writeText(md);
  };
})();