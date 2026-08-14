# Changelog

## v1.1.0 — 2026-08-14

### Payment / License Migration: Lemon Squeezy → Gumroad

- 🔑 **Gumroad License verification**: switched from Lemon Squeezy to Gumroad's public License Verify API (no seller token needed, no server required)
- 🛒 **Buy links updated**: popup / options / landing page now point to Gumroad product page
- 🧹 **Cleaned up** all Lemon Squeezy references in code, docs, and HTML
- 📦 **gumroad-listing.md**: ready-to-paste product title, description & EULA
- 📄 **LAUNCH-GUIDE.md** rewritten for the Gumroad + PayPal workflow

### Placeholders to fill in (after creating your Gumroad product)
- `YOUR_GUMROAD_PRODUCT_ID` in `lib/license.js` and `background/service-worker.js`
- `YOUR_PRODUCT_PERMALINK` in `lib/license.js`, `options/options.js`, `options/options.html`, `landing/index.html`

---

## v1.0.0 — 2026-08-13

### Initial Release

- ✨ **One-click export** for ChatGPT, Claude, DeepSeek, Gemini & 10+ AI platforms
- 📝 **3 export formats**: Markdown (.md), Word (.doc), PDF (.html for printing)
- ✋ **Manual selection mode**: click on page elements when auto-detection fails
- 🔍 **Debug mode**: F12 console logging for troubleshooting
- 🔑 **License system**: 5 free exports, then $9.9 lifetime unlock
- 🎨 **Conversation preview** in popup window
- 📋 **Copy to clipboard** as Markdown
- 🌐 **10+ platform support**: ChatGPT, Claude, DeepSeek, Gemini, 通义千问, Kimi, 豆包, 文心一言, Perplexity
- 🔒 **Privacy-first**: all processing local, no data uploads
- 💰 **Lemon Squeezy** license verification integration (legacy, replaced in v1.1.0)