# AGENTS.md

Notes for coding agents (Codex, Claude Code and others) working on this
repository. People are welcome to read them too.

Maintainer workspace: if an untracked `STAV.md` exists in the repo root, read it first — it holds the current status and hand-off notes (it is intentionally not committed).

## What this is

Zahrady Prahy (Gardens of Prague) is an illustrated, bilingual atlas of 13
Prague community gardens: <https://zahrady-prahy.vercel.app>. English is the
default; Czech is complete and chosen with the CS/EN switcher. Code is MIT,
the illustrations, maps and music are CC BY-NC-SA 4.0
([`LICENSE`](LICENSE), [`LICENSE-ASSETS.md`](LICENSE-ASSETS.md)).

Stack: React 19 on Vite, prerendered to static HTML at build time (no server
code at runtime), strict TypeScript, Tailwind 4 with hand-written CSS,
Playwright and axe for browser tests. Vercel serves `dist/` as static files
(`vercel.json`).

## Before you commit

```sh
npm run lint                    # oxlint, type-aware
npm run typecheck               # tsc --noEmit
npx oxfmt --check               # formatting; npm run format fixes it
npm test                        # unit tests (node --test)
npm run build                   # the 28 static pages in dist/, what Vercel serves
npm run test:e2e                # Playwright and axe against that build
```

CI runs the same steps. `npm run build` (`scripts/build-static.mjs`) builds the
bundle, renders every page with `src/entry-server.tsx` and makes the share
pictures; it stops when the Content-Security-Policy in `vercel.json` lacks the
hash of the one inline script (in the head of `/`), which changes with the
garden list: copy the hash it prints. The browser tests serve `dist/` with
`scripts/serve-static.mjs`, which applies the headers from `vercel.json`, and
reuse a server already running on port 4173, so stop one you started by hand
before testing a new build. They need Chromium once:
`npx playwright install chromium`.

After each production deployment, `.github/workflows/production-smoke.yml`
runs `npm run test:production` (`tests/production/`) on the deployed commit
against the live site; it never blocks a deploy. Run it by hand against a
local build with `PROD_URL=http://127.0.0.1:4173/`.

## Where things are

- `app/page.tsx`: the whole atlas. Styles are layered `globals.css`,
  `atlas.css`, `gallery.css`, then `mobile.css` (the phone layout, last).
- `lib/gardens.ts` (catalogue, search), `lib/garden-visits.ts` (visiting facts
  with sources), `lib/i18n.ts` (dictionary: `en` sets the shape, `cs` mirrors
  it).
- `components/map/MapViewport.tsx` and `lib/map/viewport.ts`: pan, zoom,
  pinch and the camera maths. `components/map/MapArt.tsx`: the illustration;
  phones start with a lighter copy (`lib/map/art.ts`, made by
  `scripts/build-map-variants.mjs`) and get the original once zoomed in.
- Addresses (`lib/routes.ts`): `/` and `/cs/` for the atlas, `/zahrada/<id>/`
  and `/cs/zahrada/<id>/` for each garden; titles, descriptions and
  structured data in `lib/page-meta.ts`. `src/main.tsx` loads the styles
  and, once the page is on screen, `src/hydrate.tsx`, which hydrates it with
  its route. There is no server: older `?zahrada=`, `?garden=` and `?lang=`
  links are turned into page addresses by the script in the head of `/`
  (`legacyRedirectScript` in `src/entry-server.tsx`). Check changes to
  routing or headers on a Vercel preview deployment before merging.
- `scripts/`: asset scripts (thumbnails, icons, sprites, map copies). The
  latin-ext fonts hold only Czech and Slovak letters; `src/fonts.css` says how
  to cut them, and `tests/fonts.test.mjs` fails when a text needs another
  letter. `tests/`: unit tests; `tests/e2e/`: smoke, layout, map picture and
  accessibility tests.
- Design work: the Impeccable skill (`.agents/skills/impeccable`,
  `.claude/skills/impeccable`) with its hooks, and `design/README.md`.

## Product rules

Read [`PRODUCT.md`](PRODUCT.md) and the principles in
[`CONTRIBUTING.md`](CONTRIBUTING.md) before changing behaviour or content.
The ones most easily broken by accident:

- Truthfulness over completeness: every visiting fact has a source and a
  check date; a missing value stays missing, never guessed.
- No data collection, analytics, forms that send anything or third-party
  runtime scripts. "Add a place" stays honestly unavailable.
- Calm: nothing starts by itself, and motion can be paused.
- Marker positions on the illustration are editorial, not geography; do not
  move them to fix a layout problem.
- Both languages say the same thing.
- Keyboard use, focus return, `aria-live` messages and the axe test stay
  intact.
- Licence files change only with the maintainer's approval.

## Working style

- Small, focused commits with English messages in the style of `git log`.
- Check interface changes in a browser at desktop and phone sizes, in both
  languages, and attach screenshots to pull requests.
- Changes reach `main` through pull requests: work on a branch
  (`claude/<id>-…` or `codex/…`), open a pull request and merge it once CI is
  green; for interface changes also check the Vercel preview deployment.
  Every merge deploys to production. Do not push to `main` directly or
  rewrite its history.
