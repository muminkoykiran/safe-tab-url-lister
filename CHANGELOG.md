# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.2.1] - 2026-08-29
### Fixed
- Firefox manifest's `strict_min_version` was `109.0`, but the `data_collection_permissions`
  key it also declares requires Firefox 140+ (142+ on Android) — `web-ext lint` flagged this
  before the first AMO submission went out. Bumped to `140.0`.


## [1.2.0] - 2026-08-29
### Added
- Two new output formats: TSV and Markdown list
- Include options for tab index, tab/opener IDs, numeric tab group, and last-accessed date
- Per-window headers (and incognito flag) in every format when "Include all windows" is checked

### Changed
- Additional escaping of CSV, TSV, and Markdown outputs, including protection against
  spreadsheet formula injection (a page title starting with `=`, `+`, `-`, or `@`)
- Restructured the include-options row with a shared "Include" group label
- The *Last Accessed* and *Group* options are hidden on Safari, which doesn't expose that
  data to extensions
- **Breaking:** JSON output fields are now conditional on their checkbox instead of always
  present — with every option unchecked, JSON now emits `{ "url": "..." }` instead of the
  previous `{ "title": "...", "url": "..." }`

Thanks to [@weisnobody](https://github.com/weisnobody) for the cross-browser support and
output format work in this release.


## [1.1.0] - 2026-08-12
### Changed
- Reorganize directory structure to support additional browsers
- Add manifests for Firefox and Safari
- Adjust code and CSS to support additional browsers


## [1.0.2] - 2026-06-23
### Changed
- New Chrome Web Store description and short summary


## [1.0.1] - 2026-06-07
### Changed
- Redesigned extension icons: indigo chain-link symbol, sharper at all sizes including 16×16 toolbar

## [1.0.0] - 2026-06-07

### Added
- List all open tab URLs from the current window or all Chrome windows
- 4 output formats: Plain URLs, Markdown links, JSON, CSV
- Option to include or exclude page titles alongside URLs
- One-click clipboard copy
- Dark mode support (follows system preference)
- Keyboard accessibility (WCAG 2.1 AA)
- Internationalization: English and Turkish (`_locales/`)
- Programmatically generated icons (16×16, 48×48, 128×128)

[1.2.1]: https://github.com/muminkoykiran/safe-tab-url-lister/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/muminkoykiran/safe-tab-url-lister/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/muminkoykiran/safe-tab-url-lister/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/muminkoykiran/safe-tab-url-lister/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/muminkoykiran/safe-tab-url-lister/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/muminkoykiran/safe-tab-url-lister/releases/tag/v1.0.0
