# AGENTS.md

Notes for coding agents (Codex, Claude Code and others) working on this
repository. People are welcome to read them too.

Maintainer workspace: if an untracked `STAV.md` exists in the repo root, read it first — it holds the current status and hand-off notes (it is intentionally not committed).

## What this is

Zahrady Prahy (Gardens of Prague) is an illustrated, bilingual atlas of 13
Prague community gardens: <https://zahrady-prahy.vercel.app>. English is the
default; Czech is complete and chosen with the CS/EN switcher. It is a project
of Usnea communitas, z. s. Code is MIT, the illustrations, maps and music are
CC BY-NC-SA 4.0 ([`LICENSE`](LICENSE), [`LICENSE-ASSETS.md`](LICENSE-ASSETS.md)).

Stack: vinext (the Next.js App Router API on Vite), React 19, strict
TypeScript, Tailwind 4 with hand-written CSS, Playwright and axe for browser
tests. The live site is the Vercel build.

## Before you commit

```sh
npm run lint                    # oxlint, type-aware
npm run typecheck               # tsc --noEmit
npx oxfmt --check               # formatting; npm run format fixes it
npm test                        # unit tests (node --test)
VERCEL=1 npm run build:vercel   # the build the live site uses
npm run test:e2e                # Playwright and axe against that build
```

CI runs the same steps; on GitHub Actions it also sets `NITRO_PRESET=vercel`,
because Nitro's provider detection otherwise prefers GitHub Actions and emits
a Node server in `.output/`. Without `VERCEL=1`, `build:vercel` builds the
Sites/Cloudflare variant instead. The browser tests reuse a server already
running on port 4173, so stop one you started by hand before testing a new
build. They need Chromium once: `npx playwright install chromium`.

## Where things are

- `app/page.tsx`: the whole atlas. Styles are layered `globals.css`,
  `atlas.css`, `gallery.css`, then `mobile.css` (the phone layout, last).
- `lib/gardens.ts` (catalogue, search), `lib/garden-visits.ts` (visiting facts
  with sources), `lib/i18n.ts` (dictionary: `en` sets the shape, `cs` mirrors
  it).
- `components/map/MapViewport.tsx` and `lib/map/viewport.ts`: pan, zoom,
  pinch and the camera maths.
- Do not add a `middleware.ts`: on Vercel it failed in production
  (`MIDDLEWARE_INVOCATION_FAILED`) although the local build passed, so a
  server-rendered `?lang=cs` needs another approach and a check on a Vercel
  preview deployment first.
- `scripts/`: asset scripts (thumbnails, icons, sprites). `tests/`: unit
  tests; `tests/e2e/`: smoke, layout and accessibility tests.
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
