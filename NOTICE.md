# Attribution and modification notice

**Spoiler Filter** is an independent fork maintained by [96dot](https://github.com/96dot). It is based on [NoVice](https://github.com/kpulka247/novice), created by [kpulka247](https://github.com/kpulka247) and the upstream contributors. Original authors retain copyright in their contributions. The upstream Git history and changelog are preserved for attribution and provenance.

Fork modifications: Copyright (C) 2026 96dot and contributing authors.

Modified on **2026-11-19**: renamed the GitHub repository to `96dot/spoiler-filter`; introduced the Spoiler Filter name and a new vector icon; replaced the fork's repository presentation and documentation; removed upstream logo and store artwork from the current tree; updated extension branding, support links, and Firefox identity; included this notice and the license in extension builds. Also modified on **2026-11-19**: added batch keyword import from pasted text and text files, duplicate detection, editable domain exclusions with subdomain matching, exclusion of embedded frames, an animated blur preview on hover or keyboard focus, and exact-URL exclusions alongside domain exclusions with navigation-aware filtering, removal of the upstream popup link, and a visible header version with a version-incrementing update build command. This feature work is tracked on [feat/batch-import-domain-exclusions](https://github.com/96dot/spoiler-filter/tree/feat/batch-import-domain-exclusions), with its dates and changes recorded in Git history.

**Update v1.3.4 — 2026-11-19:** reduced the hover and keyboard-focus preview to 10% of the original blur and shortened its animation to 0.8 seconds.

**Update v1.3.5 — 2026-11-20:** recheck recycled YouTube Shorts players, keep reveals scoped to each video instead of its channel, mute blurred Shorts and late-loaded players, and restore their prior mute state when protection is removed. Added browser regression coverage for scrolling, reveal reuse, and audio behavior.

**Update v1.3.6 — 2026-11-20:** removed the page-wide GTA warning overlay, its title replacement, scroll lock, media pausing, and page-wide reveal exemptions. Individual spoiler filtering, click-to-reveal, and Shorts muting remain available. Updated navigation, page controls, and legacy-session regression coverage.

**Update v1.3.7 — 2026-11-20:** added a localized right-click action to temporarily reveal all filtered content on the current page, including embedded frames and later-loaded items. Temporary reveals expire on reload or navigation without changing saved exclusions or individual reveal records.

The software, including these modifications and the new icon, is distributed under **GNU GPL version 3 only (SPDX: GPL-3.0-only)**. The complete, unmodified license text is in [LICENSE](LICENSE).

This program is distributed in the hope that it will be useful, but **WITHOUT ANY WARRANTY**; without even the implied warranty of **MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE**. See the GNU General Public License for details.

Corresponding source, build scripts, and modification history are available at [96dot/spoiler-filter](https://github.com/96dot/spoiler-filter). For a downloaded build, use the source from the same revision or release tag. GitHub releases provide source archives; the README describes how to build the extension.

The NoVice name, upstream logo, and upstream store graphics are reserved by the original project and are not presented as this fork's branding. Mentions of NoVice identify the upstream work and do not imply endorsement. Some internal build/DOM identifiers retain `novice` to preserve provenance and compatibility; the extension's public name and icon are different.

This fork is not an official NoVice release and is not affiliated with Rockstar Games or Take-Two Interactive. Grand Theft Auto is a trademark of Take-Two Interactive Software, Inc.
