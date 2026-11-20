# Publishing this fork

Spoiler Filter is the independent 96dot fork of [NoVice](https://github.com/kpulka247/novice). It has no separate browser-store listing at present. Upstream listings, artwork, add-on IDs, and publisher credentials belong to the original project and must not be used to present this fork as its release.

## Build artifacts

```bash
pnpm install --frozen-lockfile
pnpm icons
pnpm build
```

Builds are written to `dist/novice-chrome/` and `dist/novice-firefox/`, with ZIPs in `dist/`. The internal build filenames retain `novice` for compatibility; the displayed extension name is Spoiler Filter and the icon is newly drawn for the fork. The Firefox add-on ID is `spoiler-filter@96dot.github.io`.

Each package includes `LICENSE` and `NOTICE.md`. Preserve the GPL-3.0-only license, upstream attribution, modification notices, and warranty disclaimer. When distributing a build, provide its complete corresponding source and build scripts from the same revision alongside it; GitHub releases support matching source archives. See the full [license](../LICENSE) for its terms.

## Separate store listings

To publish later, create new Chrome Web Store and Firefox Add-ons listings under the fork owner's accounts, with their own listing IDs and credentials. Use [store-listing.md](store-listing.md) as draft text, disclose that the project is a modified fork, and link to this fork's source and license.

Generate the icon using `pnpm icons`. Capture new screenshots from the rebranded build; `pnpm screenshots` can generate them locally. Create any other promotional artwork separately. The original NoVice logo and store graphics have been removed from this fork's current tree.

## Existing release workflows

The inherited workflows in `.github/workflows/` can create releases and upload to stores when enabled and configured. Review them before enabling them for this fork. Configure only the fork's own `CHROME_EXTENSION_ID`, Chrome publisher credentials, and AMO credentials; never copy another publisher's secrets or assume their listing is available to this fork.

Changing the GitHub README or repository description does not create a store listing or publish a browser extension.
