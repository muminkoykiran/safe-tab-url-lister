# Contributing

Thanks for your interest in Safe Tab URL Lister!

## Reporting Bugs

Open an issue and include:
- Browser name and version
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

**Build the browser specific files:**

```bash
./scripts/build.sh
```

**Build and package the store zip files:**

```bash
./scripts/pkg.sh
```

* Version for the package files taken from the Chrome manifest file, though can also be supplied via the CLI (`./scripts/pkg.sh all 1.2.3`)
* Does not create a zip file for Safari since it requires Xcode.
* Both `build.sh` and `pkg.sh` will accept a browser name to only do that browser (`./scripts/build.sh firefox`)

**Javascript build and package scripts:**

* `node scripts/build.js` and `node scripts/pkg.js` also exist
  * `pkg.js` requires archiver to be installed (`npm install archiver`)

**Individual Browsers:**

```bash
node scripts/build.js
node scripts/build.js chrome
node scripts/build.js firefox
node scripts/build.js safari

node scripts/pkg.js
node scripts/pkg.js chrome
node scripts/pkg.js firefox
```


## Code Style

- Vanilla JS — no build tools, no bundlers, no npm dependencies
- Manifest V3
- All UI strings go through `chrome.i18n` (`_locales/en/messages.json`)
- WCAG 2.1 AA accessibility for all interactive elements

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
