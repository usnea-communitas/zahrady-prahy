# Changelog

Notable changes to Zahrady Prahy (Gardens of Prague). The version lives in
`package.json`; each version is also a
[GitHub release](https://github.com/usnea-communitas/zahrady-prahy/releases).

## 1.2.0 — 2026-11-12

Live since 10–11 November 2026: a static atlas with an address for every
garden, seven sourced answers on every garden page, a faster start on phones
and a monthly check of the sources.

- **Deeper garden pages.** Every garden now says what makes it special, how to get there, how accessible it is and how to join in, each with its source, or admits that the sources do not say. Three gardens name a stop (Prales, Troja, Libóza), one describes step-free beds and toilets (Prales); the rest admit the gap instead of guessing. All 28 sources of the visiting facts were read again on 11 November 2026 (89 facts, 34 of them admitted gaps), and the facts that had changed are corrected: the Prales winter hours start on 10 October, Vidimova is run by its own association and Kokoza no longer lists weekly hours, Na Polské has its own website (napolske.eu), and the place of the Na Pláni garden inside the park is no longer stated, because no current source gives it. In the detail panel each label now sits above its answer and an admitted gap reads quieter than a found fact.
- **A monthly look at the sources.** On the 3rd of every month a workflow opens every source the atlas names and updates one issue (label `source-check`) with the addresses that no longer answer or now lead elsewhere, the facts last checked more than 120 days ago and the seasonal facts whose season is over. It changes nothing in the atlas.
- **A static atlas with an address for every garden.** The atlas is now 28 prerendered pages instead of a server function: `/` and `/cs/` for the atlas, `/zahrada/<id>/` and `/cs/zahrada/<id>/` for each of the 13 gardens. Every page has its own title, description, canonical address, `hreflang` alternates, share picture made from the garden's illustration and, for a garden, schema.org `Place` data; all of them are in the sitemap. The Czech pages exist for search engines, and a garden's detail is in its page before any script runs.
- Older links keep working: `?zahrada=`, `?garden=` and `?lang=cs` are turned into the new addresses before anything renders, and a visitor who chose Czech is sent from `/` to `/cs/`. Choosing a garden or the language changes the address without loading a new page.
- "About the map" is reachable on phones from the header.
- A Content-Security-Policy for scripts: only the site's own scripts and one inline script, allowed by its hash.
- vinext, Nitro, the Cloudflare and OpenAI Sites variants and wrangler are gone (152 fewer packages); the fonts are stored with the site; `npm audit` reports nothing high or critical.
- **Faster on phones.** A phone starts with a lighter copy of the map (960 or 1280 px, 136 or 218 kB instead of 621 kB, chosen by screen density) and gets the original only once the map is zoomed in; the blurred backdrop uses the 1.5 kB placeholder. The page is shown before the app script loads, the animated sprites follow the map, the tree sprite is WebP (165 → 27 kB) and the latin-ext fonts hold only Czech and Slovak letters (Inter 85 → 6 kB). Lighthouse on a phone (median of three runs), live site before → preview after: performance 71 → 93, largest paint 6.3 → 2.5 s, first visit 1 158 → 457 KiB. Wide screens look and load as before.
- **The map as high as a phone held upright.** Chosen on 11 November 2026: the overview fills the height between the header and the controls and pans sideways, instead of showing the whole map small. A garden link opens at the same height, and the map stands at that height before the app script runs. Panning reaches all 13 gardens (checked at 320 × 568, 360 × 740 and 390 × 844). For the sharpness this needs, a phone held upright gets the original's pixels in three strips instead of the lighter copy: the middle one (165 kB) first, the other two (247 kB) once the app runs. A small phone held sideways now picks its copy by the map's real width (960 px instead of 1280 px at 2×). Lighthouse on a phone (median of three runs, Vercel previews of `main` → this change): performance 95 → 94, largest paint 2.5 → 2.6 s, first visit 457 → 735 KiB. Wide screens, tablets and larger phones held sideways look exactly as before.
- **Security headers.** `X-Content-Type-Options`, a referrer policy, frame
  protection and a permissions policy on every page; `favicon.ico` and
  `sitemap.xml`.
- Prazelenina's bar hours say that they were for the 2026 season.
- A screen-reader checklist for manual testing
  ([`docs/screen-reader-checklist.md`](docs/screen-reader-checklist.md)), an
  honest note that the original illustration prompts were lost, the favicon
  described in `LICENSE-ASSETS.md`, and 1.6 MB of unused media removed.
- Dependabot proposes dependency and workflow updates once a month.

## 1.1.0 — 2026-11-10

Two improvement rounds, live since 25 October and 8 November 2026.

- **Czech by link.** `?lang=cs` opens the atlas in Czech. It is read in the
  browser, takes precedence over a saved choice and is saved; the address
  follows the switcher, and a shared garden link carries its language.
- **Phones.** An overview with all 13 markers, pinch zoom, the OpenStreetMap
  attribution and a pause for the animation; the close button no longer covers
  text. The selected garden and both lines of its label stay above the bottom
  sheet on every phone from 320 × 568 up, and short phones get a smaller
  illustration and heading so the name and buttons stay in view.
- **Layout.** No marker hides under the header or the controls (checked at 11
  sizes in both languages); phones in landscape and low laptop screens work
  without scrolling; no text is smaller than 12 px.
- **Accessibility.** The focus order follows the visual order, button names
  start with their visible text, the page title and announcements follow the
  language, and axe reports no serious findings.
- **Faster images.** Images skip the `/_next/image` route, the list uses
  144 px thumbnails (88 kB instead of 2.9 MB), and media are cached for a day
  and refreshed in the background.
- **Checks.** Playwright and axe browser tests run in CI next to lint, type
  checks, formatting and unit tests; after every production deployment a
  workflow checks that the live atlas answers, opens a garden and works in
  Czech on a phone.
- A favicon made from the seal, `robots.txt`, notes for coding agents
  (`AGENTS.md`), and `sharp` declared for the asset scripts.

## 1.0.0 — 2026-10-24

The first stable release, in English and Czech.

- The English interface is the default, with a CS/EN switcher; all garden
  descriptions and visiting information are bilingual, and every fact has its
  source and check date.
- Shareable links (`?zahrada=`, with `?garden=` as an alias), search in both
  languages that ignores diacritics, category and feature filters, keyboard
  navigation, and an optional soundscape that never starts by itself. No
  tracking.
- Open source: MIT for the code, CC BY-NC-SA 4.0 for the media; README with
  screenshots, contributing guide, code of conduct, security policy and issue
  templates; GitHub Actions CI with lint, tests and the build.
