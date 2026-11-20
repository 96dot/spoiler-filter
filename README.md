<p align="center"><img src="src/assets/logo.svg" alt="Spoiler Filter icon" width="88"></p>

# Spoiler Filter — 96dot fork

A browser extension that blurs GTA VI spoilers and custom keywords across the web.

> **Independent fork of [NoVice by kpulka247 and contributors](https://github.com/kpulka247/novice).** This fork is maintained by [96dot](https://github.com/96dot) and uses a different name and icon. It is not an official NoVice release and is not endorsed by the upstream author. The original code remains credited to its authors and licensed under GPL-3.0-only.

**Modification notice — 2026-11-19:** this fork introduces its own name, icon, repository presentation, and extension identity. See [NOTICE.md](NOTICE.md) for attribution, modifications, and license information. The upstream license text and Git history are preserved.

## Fork development

[Batch keyword import and domain exclusions](https://github.com/96dot/spoiler-filter/tree/feat/batch-import-domain-exclusions) are available on the feature branch. Switch to that branch to use and develop those additions:

```bash
git switch feat/batch-import-domain-exclusions
```

There is no separate browser-store listing for this fork. The original project's store listings distribute the upstream extension, not these fork modifications.

## Features

- Blur matching posts in place or remove them from the page.
- Detect GTA VI names, links, and story spoilers, with a strict mode for broader GTA and Rockstar content.
- Add custom words and phrases to filter.
- Turn protection off globally or for the current site.
- Use the popup and labels in 20 languages.
- Run filtering locally on your device.

On the feature branch, **Custom keywords → Import keywords** accepts comma-separated or one-per-line lists, pasted directly or loaded from a `.txt` file. Existing keywords are kept; duplicates and entries over 60 characters are skipped. Imports accept up to 1 MB of text.

The feature branch also adds **Excluded sites**. Enter a domain or website URL to exclude its hostname and subdomains, including embedded frames on excluded pages. Remove its **×** chip to restore protection immediately.

Hover over a blurred item (or focus it with the keyboard) to preview it at half blur: the blur gradually reduces from 24px to 12px over 1.5 seconds. Moving away restores full blur immediately. Click to reveal the item completely. The hover animation respects your system’s reduced-motion preference.

## Build and install locally

Install Node.js 22 or later, pnpm 11, and Git, then:

```bash
git clone https://github.com/96dot/spoiler-filter.git
cd spoiler-filter
# Optional: switch to the feature branch described above.
pnpm install --frozen-lockfile
pnpm build
```

In Chrome or a Chromium-based browser, open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked**, and select `dist/novice-chrome/`.

In Firefox, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `dist/novice-firefox/manifest.json`.

The build folders retain the internal `novice` identifier. Both builds display **Spoiler Filter** with the fork's new icon and include copies of `LICENSE` and `NOTICE.md`.

## Development

```bash
pnpm dev           # build both browsers and watch for changes
pnpm test          # unit tests
pnpm test:e2e      # extension tests in Chromium
pnpm format:check  # check formatting
pnpm lint:firefox  # lint the Firefox build
```

Read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing. Report fork-specific bugs in [this fork's issue tracker](https://github.com/96dot/spoiler-filter/issues). Keep story spoilers out of issue titles, descriptions, and screenshots.

## Attribution and license

Original project: [NoVice](https://github.com/kpulka247/novice) by [kpulka247](https://github.com/kpulka247) and contributors. Original authors retain copyright in their contributions; changes made in this fork are identified in [NOTICE.md](NOTICE.md) and the commit history.

The code and this fork's new icon are licensed under **[GNU GPL version 3 only](LICENSE)**. You may copy, modify, and redistribute the software under that license, including its source-distribution and notice requirements. This software is provided **without warranty**; see the license for details.

The upstream NoVice name, logo, and store graphics are reserved by the original project. This fork uses its own public name and icon and removes those upstream graphics from its current presentation. Historical upstream commits and [CHANGELOG.md](CHANGELOG.md) are retained for provenance.

An unofficial fan project, not affiliated with Rockstar Games or Take-Two Interactive. Grand Theft Auto is a trademark of Take-Two Interactive Software, Inc.
