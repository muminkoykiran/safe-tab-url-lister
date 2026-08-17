# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.2.0] - 2026-08-10
### Changed
- Add Markdown List and TSV Output options
- Add include options for tab index, ids and groups
- Add include option for last accessed date
- Additional escaping of CSV (and TSV) and Markdown outputs
- Added requirement for TabGroups permissions
- If All Windows is selected, include Window header between links for different Windows


## [1.1.0] - 2026-08-07
### Changed
- Reorginize directory structure to support additional browsers
- Add manifests for Firefox and Safari
- Adjust code and CSS to support additional browsers


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
