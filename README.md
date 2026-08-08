# Safe Tab URL Lister — Copy All Chrome Tab URLs Instantly

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-v1.0.1-blue?logo=google-chrome)](https://chrome.google.com/webstore/detail/lfoiekncpjoomigglgjildmjodpfmoif)
[![i18n](https://img.shields.io/badge/i18n-EN%20%7C%20TR-orange.svg)](_locales/)

A free, open-source Chrome extension that collects every URL from your open tabs and copies them in the format you need — plain text, Markdown links, a JSON array, or CSV. No servers, no tracking, no accounts. Everything runs locally in your browser.

---

## The Problem This Solves

When you have 20, 50, or 100 tabs open and need to save, share, or process those URLs, Chrome gives you no built-in way to extract them as text. Bookmarking all tabs is permanent and clutters your bookmark bar. Taking a screenshot loses the clickable URLs. Manually copying each address is slow and error-prone.

Safe Tab URL Lister solves this in one click. Click the icon, choose your format (plain text, Markdown, JSON, or CSV), and copy. Your URLs are on the clipboard, ready to paste into a document, a spreadsheet, a code editor, or an AI chat window.

---

## Quick Facts

| Property | Value |
|---|---|
| Output formats | Plain URLs, Markdown links, JSON array, CSV |
| Permissions required | `tabs` only |
| Network requests | Zero |
| Data collection | None |
| Price | Free |
| Source | Open source (MIT) |
| Minimum Chrome version | 88 |
| Languages | English, Turkish |
| Accessibility | WCAG 2.1 AA |

---

## Screenshots

| Plain URLs | Markdown Links | Dark Mode |
|:---:|:---:|:---:|
| ![Plain](docs/screenshots/store-screenshot-1-plain.png) | ![Markdown](docs/screenshots/store-screenshot-2-markdown.png) | ![Dark](docs/screenshots/store-screenshot-3-dark.png) |

---

## Features

- **List URLs** from the current window or all open Chrome windows
- **Include page titles** alongside each URL (optional)
- **4 output formats:**
  - Plain URLs — one per line
  - Markdown links — `[Page Title](https://url)`
  - JSON — structured array for developers
  - CSV — spreadsheet-ready with optional titles
- **One-click copy** to clipboard
- **Dark mode** support (follows system preference)
- **Keyboard accessible** (WCAG 2.1 AA)
- **Bilingual** — English and Turkish

---

## Who Uses This

**Researchers and academics** — capture all source URLs at the end of a reading session without manually copying each address.

**Developers and engineers** — grab all open tabs as a JSON array to pipe into scripts, bug reports, or data tools.

**Writers and editors** — export tabs as Markdown links (`[Page Title](URL)`) ready to paste directly into articles, wikis, README files, or documentation.

**Students** — save all reference tabs before closing the browser so nothing is lost between study sessions.

**Data analysts** — export to CSV and open directly in Excel, Google Sheets, or LibreOffice Calc.

**AI assistant users** — paste a clean URL list into ChatGPT, Claude, Gemini, or Perplexity to let the AI summarize, categorize, or compare your open pages.

---

## Privacy

This extension is designed with a minimal-permission, zero-data-collection approach:

| What | Status |
|------|--------|
| Permissions | Only `tabs` — nothing else |
| `host_permissions` | None |
| Background service worker | None |
| Network requests | None |
| Data collection / analytics | None |
| Cookies / storage | None |
| External dependencies | None |

**Your browsing data never leaves your device.** The extension processes everything in memory and discards it when the popup closes. Safe for use in enterprise environments and sensitive browsing sessions.

---

## Installation

### From Chrome Web Store

[Install from the Chrome Web Store](https://chrome.google.com/webstore/detail/lfoiekncpjoomigglgjildmjodpfmoif)

### Load Unpacked (Developer Mode)

1. Clone or download this repository
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** → select this folder

---

## Output Format Examples

### Plain URLs

One URL per line, with no decoration. Use this when you want the simplest possible output to paste into a text file, a terminal command, or a message.

```
https://github.com
https://example.com
https://news.ycombinator.com
```

### Markdown Links

Outputs `[Page Title](URL)` for each tab. Paste directly into any Markdown editor, GitHub README, Notion page, Obsidian vault, or wiki.

```markdown
[GitHub](https://github.com)
[Example Domain](https://example.com)
[Hacker News](https://news.ycombinator.com)
```

### JSON Array

Outputs a JSON array of objects. Each object contains a `title` string and a `url` string. Use this format when you want to process the tab list programmatically — pipe it into `jq`, load it in Node.js, or feed it to an API.

```json
[
  { "title": "GitHub", "url": "https://github.com" },
  { "title": "Example Domain", "url": "https://example.com" },
  { "title": "Hacker News", "url": "https://news.ycombinator.com" }
]
```

### CSV

Outputs a header row (`title,url`) followed by one quoted row per tab. Open directly in Microsoft Excel, Google Sheets, or any CSV-compatible tool.

```csv
title,url
"GitHub","https://github.com"
"Example Domain","https://example.com"
"Hacker News","https://news.ycombinator.com"
```

---

## How It Compares

| Method | Drawback |
|---|---|
| Bookmark all tabs | Permanent, clutters bookmarks, not portable as text |
| Screenshot | Not selectable text, no clickable links |
| Session manager extensions | Often require accounts or sync, large permission sets |
| Manual copy-paste | Slow, error-prone for more than a handful of tabs |
| **Safe Tab URL Lister** | **One click, 5 formats, zero tracking, no account needed** |

---

## Browser Compatibility

Built with Manifest V3. Works in any Chromium-based browser that supports MV3 extensions:

- Google Chrome 88+
- Microsoft Edge 88+
- Brave Browser
- Vivaldi
- Opera (with Chrome extension support enabled)
- Firefox
- Safari (MacOs and iOS)
  - Last Accessed date and tab group information not available

---

## Frequently Asked Questions

**How do I copy all my open Chrome tab URLs at once?**
Install Safe Tab URL Lister, click the extension icon, and press Copy. All tab URLs from the current window are on your clipboard immediately.

**Can I export Chrome tabs as Markdown links?**
Yes. Select "Markdown links" from the format dropdown. The output will be a list of `[Page Title](URL)` entries, one per tab, ready to paste into Obsidian, Notion, GitHub, or any Markdown editor.

**Is there a Chrome extension that exports tabs as JSON?**
Yes. Select the JSON format. The output is a JSON array where each element has a `title` and a `url` field.

**Does this extension send my data anywhere?**
No. There are zero network requests. The extension has no servers, no analytics, and no external dependencies of any kind. Your URLs never leave your device.

**How do I save all Chrome tabs without using bookmarks?**
Use Safe Tab URL Lister to copy your tabs as plain text or CSV, then paste into any text editor or spreadsheet for future reference.

**Can I get tab URLs from multiple Chrome windows?**
Yes. Enable the "Include all windows" checkbox to collect tabs from every open Chrome window at once.

**Does it work offline?**
Yes, completely. The extension has no dependency on any external service.

**Can I use this with Incognito tabs?**
Chrome requires you to manually grant extensions access to Incognito mode. Go to `chrome://extensions`, find Safe Tab URL Lister, and enable "Allow in Incognito".

---

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, code style guidelines, and how to build the store zip.

**Regenerate icons:**
```bash
node generate-icons.js
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## License

[MIT](LICENSE) © 2026 Mümin Köykıran
