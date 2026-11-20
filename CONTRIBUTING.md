# Contributing to Spoiler Filter

Thank you for helping people go into GTA VI blind. Bug reports, new terms, site support, and code improvements are all welcome.

## Before you start

This is the independent 96dot fork of [NoVice](https://github.com/kpulka247/novice). The software and fork modifications are licensed under [GPL-3.0-only](./LICENSE); contributions use the same license. Preserve attribution and dated modification notices in [NOTICE.md](./NOTICE.md). The original NoVice name, logo, and store graphics are reserved by the upstream project. This fork uses the name Spoiler Filter and a newly drawn icon.

Keep spoilers out of everything you post here: issues, pull requests, commit messages, and screenshots. Other people read them too.

## Report a spoiler that got through

[Open a spoiler report](https://github.com/96dot/spoiler-filter/issues/new?template=spoiler.yml). The form asks for the page address, what you saw, and your browser. Describe the spoiler without repeating it.

To report a security problem, follow [SECURITY.md](./SECURITY.md) instead of opening an issue.

## Set up the project

You need [Node.js](https://nodejs.org) 22 or later, [pnpm](https://pnpm.io/) 11, and [Git](https://git-scm.com/).

1. Fork the repository on GitHub.
2. Clone your fork and add this repository as `upstream`. Replace `YOUR_GITHUB_USERNAME` with your username:
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/spoiler-filter.git
   cd spoiler-filter
   git remote add upstream https://github.com/96dot/spoiler-filter.git
   git fetch upstream
   ```
3. Install the dependencies and the Chromium build that the end-to-end tests use:
   ```bash
   pnpm install
   pnpm exec playwright install chromium
   ```
4. Start the development build. It rebuilds on every change:
   ```bash
   pnpm dev
   ```
5. Load the extension in your browser:
   - **Chrome.** Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and select `dist/novice-chrome/`.
   - **Firefox.** Open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `manifest.json` in `dist/novice-firefox/`.

## Project layout

| File                             | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/spoilers.js`                | What counts as a spoiler. `EXPLICIT_TERMS` lists the title in every script, the characters, the places, and death phrases. `FRANCHISE_TERMS` lists what strict mode adds: the series, the studio and its people, insiders and leakers, GTA creators, roleplay servers, ambiguous Leonida names, and the wider GTA universe. `STORY_TERMS` lists story words that count only on pages about GTA. `findSpoiler()`, `findUrlSpoiler()`, and `findStorySpoiler()` are the matchers. |
| `src/sites.js`                   | Where a self-contained card starts and ends on each supported site, the fallback for every other site, the shelves that collapse when remove mode empties them, and the **See more** buttons to click.                                                                                                                                                                                                                                                                          |
| `src/settings.js`                | The stored settings (`enabled`, `strict`, `style`, `allowedSites`, `keywords`) and their defaults.                                                                                                                                                                                                                                                                                                                                                                              |
| `src/locales.js`                 | Every user-facing string in every language. The build turns it into `_locales/*/messages.json`.                                                                                                                                                                                                                                                                                                                                                                                 |
| `src/styles/tokens.css`          | The colors and font shared by the blur tags, the page cover, and the popup.                                                                                                                                                                                                                                                                                                                                                                                                     |
| `src/content/blocker.js`         | Walks the page, checks text and attributes, and blurs or reveals cards.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `src/content/reveals.js`         | Remembers the cards and pages that the user revealed, for the tab's session.                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/content/shield.js`          | The page cover.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `src/content/index.js`           | Starts the blocker, watches the page for changes, handles click-to-reveal, and decides when to cover the page.                                                                                                                                                                                                                                                                                                                                                                  |
| `src/popup/popup.js`             | The toolbar popup: the on and strict switches, the blur style, the per-site switch, and the custom keywords.                                                                                                                                                                                                                                                                                                                                                                    |
| `src/background.js`              | The toolbar badge, and protecting tabs that were open at install time.                                                                                                                                                                                                                                                                                                                                                                                                          |
| `public/manifest.json`           | The shared manifest. `webpack.config.js` adds the Chrome or Firefox background and the Firefox ID at build time.                                                                                                                                                                                                                                                                                                                                                                |
| `scripts/build-icons.js`         | Renders this fork’s icons from `src/assets/logo.svg`. Run it with `pnpm icons`. Original upstream store graphics are not included.                                                                                                                                                                                                                                                                                                                                              |
| `scripts/capture-screenshots.js` | Loads the extension into Chromium, opens YouTube, Wikipedia, Steam, and Twitch, and writes the README graphics and the framed store screenshots. Run it with `pnpm screenshots`.                                                                                                                                                                                                                                                                                                |

## Add a term, a site, or a language

- **A new term.** Add it to `EXPLICIT_TERMS` in `src/spoilers.js` if it always means GTA VI, or to `FRANCHISE_TERMS` if it only hints at GTA and should be blurred in strict mode. Add an example that must be blocked to `SPOILERS` in `test/unit/spoilers.test.js`. If the term is close to common words, add a phrase that must stay visible to `SAFE`.
- **A new site.** Add an entry to `SITE_UNITS` in `src/sites.js`. List the selectors of the smallest element that holds one whole item, such as a post or a video tile, so its thumbnail is blurred with its title.
- **A new language.** Copy the `en` block in `src/locales.js`, rename it to the [Chrome locale code](https://developer.chrome.com/docs/extensions/reference/api/i18n#locales), and translate every value. `pnpm test` checks that no key is missing and that the store description fits in 132 characters.

## Check your change

Run these commands before you open a pull request. CI runs the same checks.

```bash
pnpm format         # format the code with Prettier
pnpm test           # matcher and translation tests
pnpm test:e2e       # builds the extension and checks it in Chromium
pnpm build          # production build
pnpm lint:firefox   # lints the Firefox build from pnpm build
```

Test the change by hand in Chrome and Firefox too.

## Name your pull request

This project releases automatically from [Conventional Commits](https://www.conventionalcommits.org/). Name your local commits however you like. The pull request title must follow the format below and be in English. When the pull request is merged, its commits are squashed into one commit with the pull request title, and the release reads that title. A check on the pull request fails until the title follows the format.

Format: `<type>(<optional scope>): <description>`

Allowed types:

- `fix` is a bug fix and releases a patch, for example `fix: hide reddit search result cards`.
- `feat` is a new feature and releases a minor version, for example `feat(sites): block spoilers on threads`.
- `perf` makes something faster and releases a patch.
- `refactor` changes code without changing behavior.
- `test` adds or changes tests only.
- `docs` changes documentation only.
- `ci` changes the GitHub workflows.
- `build` changes the build or the dependencies.
- `chore` covers other maintenance.

The scope is the area you changed, such as `sites`, `spoilers`, `popup`, or `readme`. Start the description with a lowercase verb, and do not end it with a period.

## Submit a pull request

All pull requests target the `dev` branch, not `main`.

1. Create a branch from the latest `dev`:
   ```bash
   git fetch upstream
   git checkout -b feat/my-change upstream/dev
   ```
2. Make your change, and run the checks in [Check your change](#check-your-change).
3. Push the branch to your fork:
   ```bash
   git push origin feat/my-change
   ```
4. Open a pull request against `dev`. Fill in the template, and check that the title follows [the format](#name-your-pull-request).
