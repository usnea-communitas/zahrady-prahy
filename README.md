# Zahrady Prahy — Gardens of Prague

**A living, illustrated map of Prague's community gardens.**

[![Code: MIT](https://img.shields.io/badge/code-MIT-4c7a3a.svg)](LICENSE)
[![CI](https://github.com/usnea-communitas/zahrady-prahy/actions/workflows/ci.yml/badge.svg)](https://github.com/usnea-communitas/zahrady-prahy/actions/workflows/ci.yml)
[![Media: CC BY-NC-SA 4.0](https://img.shields.io/badge/media-CC%20BY--NC--SA%204.0-8a6d3b.svg)](LICENSE-ASSETS.md)
[![Node 22](https://img.shields.io/badge/node-%3E%3D22.13-5f8f3e.svg)](package.json)
[![Languages: EN · CS](https://img.shields.io/badge/languages-EN%20%C2%B7%20CS-6a7d8a.svg)](#localisation)

**Live:** <https://zahrady-prahy.vercel.app>

Zahrady Prahy ("Gardens of Prague") is a storybook-style illustrated map of
Prague with thirteen community gardens drawn on it. Click a garden and you get
its illustration, a short description, practical visiting information where
every fact carries its source and the date it was checked, and a link to the
real location on a geographic map. The interface is in English by default and
fully available in Czech.

![The illustrated map of Prague with the thirteen garden markers, search, the EN | CS switcher, filters and the character-of-the-place legend](docs/screenshots/atlas-desktop.webp)

<p align="center">
  <img src="docs/screenshots/atlas-phone.webp" alt="The illustrated map on a phone held upright: as high as the screen between the search and the map controls, with garden markers; it pans sideways to the other gardens" width="32%">
  <img src="docs/screenshots/garden-detail-phone.webp" alt="A garden detail on a phone: illustration labelled as an artistic rendering, description, tags and sourced visiting information" width="32%">
</p>

## What it does

- **An illustrated atlas, not a navigation map.** Prague is drawn as a
  hand-painted storybook plate; the thirteen gardens are placed on it
  editorially. Each garden has its own illustration, labelled as an artistic
  rendering. A link in every detail panel opens the real coordinates in a
  geographic map.
- **Search that ignores diacritics**, in both languages: "liboza", "LIBÓZA",
  "wheelchair" and "bezbariérové" all work, and words can come in any order.
- **Category legend and feature filters** (for children, wheelchair accessible,
  compost, events), and a plain list for anyone who prefers it to the map.
- **Shareable links.** `?zahrada=liboza` opens a garden directly (`?garden=`
  is accepted as an alias); search, category and filters round-trip through
  the URL too.
- **Sourced visiting information.** Every garden answers the same questions:
  what makes it special, when to come, access, where to find the entrance,
  how to get there, accessibility and how to join in. Each answer is a
  separate fact with a source link and a check date. When a source does not
  say, the atlas admits it instead of guessing: _not found_ means "the
  sources do not say", never "closed", "out of reach" or "not accessible".
- **An optional soundscape**, "Zahrady nad Vltavou", that plays only when you
  press the note button. Nothing autoplays.
- **Keyboard accessible**: the map pans with the arrow keys and zooms with
  `+`/`-`/`0`, panels return focus to where you came from, and status changes
  (sound, full screen, copied link) are announced through `aria-live`
  regions.
- **No tracking, no data collection.** No analytics, no cookies, no forms. The
  only things stored are in your own browser: the chosen language and the
  postcard's position.
- Built for desktop; a phone layout exists (held upright, the map fills the
  height and pans sideways; details and list as bottom sheets) but is
  secondary.

## Who it is for

People who want to explore Prague's community gardens and urban nature on
their own, at their own pace. It is built and maintained by
[Martin Pazderník](https://github.com/martinpazdernik-source).

## Tech stack

- [React 19](https://react.dev) on [Vite](https://vite.dev), prerendered to
  static HTML at build time: 28 pages (the atlas and each garden, in English
  and Czech), no server code at runtime
- [TypeScript](https://www.typescriptlang.org), strict
- [Tailwind CSS 4](https://tailwindcss.com) for utilities, plus hand-written
  CSS for the atlas
- [Base UI](https://base-ui.com) primitives through
  [shadcn](https://ui.shadcn.com) (button, input, dialog)
- [lucide-react](https://lucide.dev) icons
- Unit tests with the built-in `node:test` runner, browser tests with
  [Playwright](https://playwright.dev) and axe, linting with
  [oxlint](https://oxc.rs), formatting with oxfmt
- Served as static files by [Vercel](https://vercel.com) (`vercel.json`)

No database, no backend, no third-party scripts at runtime. The fonts (Inter,
Playfair Display, JetBrains Mono; SIL Open Font License) are stored in
`public/fonts/`.

## Getting started

Requires Node.js 22.13 or newer.

```sh
npm ci                        # install exactly the locked dependencies
npm run dev                   # start the development server
npm test                      # run the unit tests (node --test)
npm run lint                  # oxlint, including type errors
npm run typecheck             # tsc --noEmit
npm run build                 # the static pages in dist/, as deployed on Vercel
npm run test:e2e              # browser tests against that build
```

The browser tests need Chromium once: `npx playwright install chromium`.

After every production deployment, `.github/workflows/production-smoke.yml`
runs `npm run test:production` on the deployed commit against the live site:
it must answer, show all 13 gardens and open one, the Czech and garden pages
must exist with their share pictures, and an older `?lang=cs` link must open a
garden in Czech on a phone, without console errors or failed requests.
It never blocks a deploy. `PROD_URL` points it elsewhere, for example at a
local build on `http://127.0.0.1:4173/`.

`npm run preview` serves `dist/` the way Vercel does (headers from
`vercel.json`, trailing slashes, the 404 page).

### Addresses

| Page      | English          | Czech               |
| --------- | ---------------- | ------------------- |
| The atlas | `/`              | `/cs/`              |
| A garden  | `/zahrada/<id>/` | `/cs/zahrada/<id>/` |

Each page has its own title, description, canonical address, `hreflang`
alternates, share picture (`/og/<id>.jpg`, made at build time from the
garden's illustration) and, for a garden, schema.org `Place` data; all pages
are in `sitemap.xml`. Search and filters stay query parameters. Older links
(`?zahrada=`, `?garden=`, `?lang=cs`) still work: a small script in the head of
`/` sends them to the matching page before anything renders, and also sends a
visitor who chose Czech before from `/` to `/cs/`.

## Project structure

```
app/
  page.tsx              The whole atlas: map, header, filters, details, dialogs
  globals.css           Base styles and atlas chrome
  atlas.css, gallery.css, mobile.css
                        Structural, theme and phone-layout overrides
src/
  main.tsx              Styles, then the app once the page is on screen
  hydrate.tsx           Hydrates the prerendered page with its route
  entry-server.tsx      Renders each page and its head for the build
  fonts.css             The fonts (latin-ext cut to Czech and Slovak letters)
components/
  i18n/                 LocaleProvider (locale state, useT hook) and LanguageSwitcher
  map/                  MapViewport (pan/zoom, keyboard), MapArt (the illustration
                        and its phone versions) and MapMotionLayer (boats, birds)
  ui/                   shadcn/Base UI primitives
lib/
  i18n.ts               Interface dictionary (en, cs), locale helpers, date formatting
  gardens.ts            The garden catalogue, categories, tags, filters and search
  garden-visits.ts      Visiting facts with sources and check dates, per garden
  routes.ts             Page addresses: /, /cs/, /zahrada/<id>/, /cs/zahrada/<id>/
  page-meta.ts          Titles, descriptions, share pictures and structured data
  atlas-navigation.ts   Address state: the page path plus ?q, ?typ, ?filtry
  webmcp.ts             Optional read-only catalogue search for browsers with WebMCP
  map/                  Viewport maths, projection, river geometry, map picture files
public/
  map/, gardens/, audio/  Illustrations, sprites and the soundscape (see LICENSE-ASSETS.md)
tests/                  Unit tests: catalogue, fonts, i18n, navigation, viewport
tests/e2e/              Browser tests (Playwright): smoke, layout, every text fits, map picture, accessibility
tests/production/       Live-site check run after each production deployment
docs/                   Rebuild notes and media provenance (prompts and tools)
design/                 Design tokens and theme reference
scripts/                The static build, its server and asset scripts (sprites,
                        phone versions of the map, thumbnails)
PRODUCT.md              Product principles the project is held to
```

## Adding or correcting a garden

The catalogue is plain TypeScript, so a correction is a small pull request.

1. **Facts about a garden** (description, tags, category, coordinates, source
   page) live in [`lib/gardens.ts`](lib/gardens.ts). Every reader-facing text
   is written in both languages (`{ cs, en }`). Names, neighbourhoods and street
   addresses are proper nouns and stay in Czech; add an English `gloss` for the
   name where it helps.
2. **Visiting information** lives in [`lib/garden-visits.ts`](lib/garden-visits.ts).
   Each fact has a `text` in both languages, a `state` (`published`,
   `not-found` or `not-checked`), one or more `sources` (URL and label) and
   inherits the check date. Every garden has the same facts, in the order the
   detail panel shows them (`visitFactKeys`): what makes it special, hours,
   access, entrance (the only optional one), getting there, accessibility and
   how to join in. Keep them separate; do not present the opening hours of a
   wider site as the garden's own, and name a stop or step-free access only
   when a source does.
3. **Say what the source says, in both languages.** If the Czech text says a
   schedule was not found, the English text must say the same. Never fill a
   gap with a guess; a test checks this.
4. **Record the check date.** `GARDEN_VISIT_CHECKED_AT` is the day all sources
   were last verified. Update it only after re-checking every source; for a
   single correction, mention the date you checked in the pull request.
5. A new garden also needs an illustration in `public/gardens/` (then run
   `node scripts/build-thumbnails.mjs` for its list thumbnail), an entry in
   `artPositions` (its editorial place on the drawing; the tests check that
   west-bank gardens stay west of the river) and real `lat`/`lon` for the
   map link.

Contributions of verified data are very welcome, including corrections of
hours that have changed. Please include the source URL and the date you
checked it; the
[garden data issue template](.github/ISSUE_TEMPLATE/garden_data.md) asks for
exactly that if you would rather report than edit.

## Localisation

The interface has a small, dependency-free localisation layer:

- [`lib/i18n.ts`](lib/i18n.ts) holds the typed dictionary. English defines
  the shape; the Czech object must provide every key (TypeScript and a test
  enforce this). Strings that depend on a number are functions, so Czech can
  use its three plural forms.
- [`components/i18n/LocaleProvider.tsx`](components/i18n/LocaleProvider.tsx)
  keeps the current language. Every page is built in its own language
  (`/…` English, `/cs/…` Czech); the switcher changes the language in place,
  replaces the address with the other language's page and remembers the
  choice (`localStorage` key `zahrady.lang`), so `/` sends a returning Czech
  visitor to `/cs/`. `useT()` returns the dictionary for the current
  language, `useLocale()` also returns the locale and the setter.
- The CS/EN switcher in the header is a group of `aria-pressed` buttons and
  announces the change politely in the language just chosen.
- Content is bilingual at the data level (`Localized` fields in
  `lib/gardens.ts` and `lib/garden-visits.ts`) and resolved with the locale.

To add a string, add it to the `en` object in `lib/i18n.ts`; the compiler
will tell you where the Czech version is missing. To add a third language,
extend `locales`, add a dictionary and a translation for every `Localized`
content field.

## Status and roadmap

What is live today:

- The illustrated map and the content for all 13 gardens, with sources checked
  on 11 November 2026.
- English and Czech interface and content.
- Search, filters, shareable links, keyboard navigation, the soundscape.
- A phone layout that works but is secondary to the desktop experience.

Deliberate gaps and what comes next:

- **The suggestion form is intentionally disabled.** The "Add a place" button
  opens an honest notice that tips are not accepted yet, because there is no
  storage and no review process; there is no fake "sent" state. Suggestions
  arrive through GitHub issues and pull requests instead.
- Visiting facts need periodic re-verification; the check date is shown in
  every detail panel. On the 3rd of every month a workflow
  ([`source-check.yml`](.github/workflows/source-check.yml), run by
  `scripts/check-sources.mjs`) opens every source and updates one issue
  labelled `source-check` with the addresses that no longer answer or now
  lead elsewhere and the facts last checked more than 120 days ago. It changes
  nothing itself: a person reads the source and corrects the fact.
- Possible later increments: curated walking routes based on verified public
  access, more gardens, and a review process for public suggestions once
  storage and moderation exist.

There are no usage statistics, testimonials or visitor numbers to report, and
none are invented.

What changed in each version is in [CHANGELOG.md](CHANGELOG.md) and on the
[releases page](https://github.com/usnea-communitas/zahrady-prahy/releases).

## Contributing

Bug reports, data corrections and pull requests are welcome. Please read
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the workflow and the principles the
project is held to (truthfulness over completeness, nothing autoplays,
nothing collects data, accessibility is preserved), and the
[Code of Conduct](CODE_OF_CONDUCT.md). Security concerns go to the address in
[`SECURITY.md`](SECURITY.md).

Before opening a pull request, run `npm test`, `npm run lint`,
`npm run typecheck`, `npm run build` and `npm run test:e2e`.

## License

- **Code**: [MIT](LICENSE), copyright (c) 2026 Martin Pazderník.
- **Illustrations, map artwork, postcard and soundscape** in `public/`:
  [CC BY-NC-SA 4.0](LICENSE-ASSETS.md), copyright (c) 2026 Martin Pazderník.
  Their provenance, including the tools and prompts used, is documented in
  [`docs/visual-generation-prompts.md`](docs/visual-generation-prompts.md).
- River geometry derived from OpenStreetMap data, © OpenStreetMap
  contributors, [ODbL](https://www.openstreetmap.org/copyright).

## Contact

The source lives on
[GitHub](https://github.com/usnea-communitas/zahrady-prahy). Contact:
<martin@usnea.ngo>.
