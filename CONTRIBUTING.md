# Contributing

Thanks for your interest in Safe Tab URL Lister!

## Reporting Bugs

Open an issue and include:
- Chrome version
- Operating system
- Steps to reproduce
- What you expected vs. what happened

## Suggesting Features

Open an issue with the `enhancement` label. Describe the use case clearly — this extension is intentionally minimal, so new features are evaluated against the core privacy-first, zero-dependency philosophy.

## Submitting Pull Requests

1. Fork the repository and create a branch from `main`
2. Make your changes — keep the scope narrow
3. Test the extension locally (see Development below)
4. Open a PR with a clear description of what changed and why

## Development

**Load the extension unpacked:**

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select this project folder
4. The extension icon appears in the toolbar

**Regenerate icons** (only needed if you change the icon design):

```bash
node generate-icons.js
```

**Build the store zip:**

```bash
zip -r safe-tab-url-lister-v1.0.0.zip . \
  --exclude "*.DS_Store" \
  --exclude "*.zip" \
  --exclude "*.png" \
  --exclude "generate-icons.js" \
  --exclude ".git/*" \
  --exclude ".playwright-mcp/*" \
  --exclude "node_modules/*" \
  --exclude "docs/*" \
  --exclude "CONTRIBUTING.md" \
  --exclude "CHANGELOG.md"
```

## Code Style

- Vanilla JS — no build tools, no bundlers, no npm dependencies
- Manifest V3
- All UI strings go through `chrome.i18n` (`_locales/en/messages.json`)
- WCAG 2.1 AA accessibility for all interactive elements

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
