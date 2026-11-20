# Delivering updates

The user requires a new visible version number for every delivered extension update.

- After changing the extension, run `pnpm build:update` once for that delivery. It increments the patch version in `package.json` and builds both browsers.
- Commit the incremented `package.json` with the change. Report the resulting version to the user.
- Verify that both built manifests and the popup's header show the same version. The popup reads the installed manifest, so it identifies the build actually loaded in the browser.
- Use `pnpm build` for reproducible rebuilds and validation of the same update. The semantic-release workflow already assigns its own version and must continue using `pnpm build`.
- Keep the user's existing unpacked-extension paths (`dist/novice-chrome/` and `dist/novice-firefox/`).
- Keep upstream attribution and the unmodified GPL license in the source and packaged notices. The upstream NoVice link has been removed from the popup at the user's request.
