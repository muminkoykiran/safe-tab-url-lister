# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.2.x   | Yes       |
| < 1.2   | No        |

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report them privately via [GitHub's private vulnerability reporting](https://github.com/muminkoykiran/safe-tab-url-lister/security/advisories/new).

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

You'll receive a response within 48 hours. If confirmed, a fix will be released as soon as possible and you'll be credited in the CHANGELOG.

## Security Design

This extension is designed to minimize attack surface:

- **No network requests** — nothing is sent anywhere
- **No `host_permissions`** — cannot read page content
- **No `storage` permission** — nothing is persisted
- **No `background` service worker** — runs only when popup is open
- **No external scripts** — zero CDN or third-party JS
- **Only `tabs` permission** — reads the URL, title, index, tab/opener/group IDs, last-accessed
  time, and incognito flag of open tabs, all in memory only, discarded when the popup closes
