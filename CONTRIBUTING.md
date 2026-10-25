# Contributing to Zahrady Prahy

Thank you for helping. The most valuable contributions are **verified
corrections to garden data**, followed by accessibility and bug fixes.
Everything below is here to make those easy.

## Ways to contribute

- **Report a wrong or outdated fact** with the
  [garden data template](.github/ISSUE_TEMPLATE/garden_data.md). Include the
  source URL and the date you checked it.
- **Report a bug** with the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).
- **Suggest a feature** with the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
  Please read the principles below first; some things are deliberately not
  done.
- **Open a pull request** for any of the above. Small, focused pull requests
  are easiest to review.

## Principles the project is held to

These come from [`PRODUCT.md`](PRODUCT.md) and are checked in review:

1. **Truthfulness over completeness.** A missing value is shown as missing.
   Never guess opening hours, entrances or access rules; never present the
   hours of a wider site as the garden's own. Every published fact needs a
   source URL and a check date. In the visiting data, `not-found` means "no
   regular schedule found in the source", not "closed".
2. **Both languages say the same thing.** Every reader-facing content field
   is `{ cs, en }`. If the Czech text admits a gap, the English must admit the
   same gap. Garden names, neighbourhoods and street addresses are proper
   nouns and stay in Czech.
3. **The illustration is an experience, not a navigation layer.** Positions on
   the drawing are editorial. Real coordinates stay in `lat`/`lon` and only
   feed the geographic map link.
4. **Calm.** Nothing starts by itself (no autoplay, no sound on first click),
   nothing collects data (no analytics, no forms that send anything), no
   third-party scripts at runtime.
5. **Accessibility is preserved.** Keyboard operation of the map and panels,
   focus return when a panel closes, `aria-live` announcements for status
   changes, visible focus styles and sensible `aria-label`s are part of the
   product, not polish.
6. **Honest states.** No fake "sent" confirmations, no invented users,
   testimonials or statistics, anywhere, including documentation.

## Development

Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Before you push:

```sh
npm test                      # unit tests (node --test)
npm run lint                  # oxlint, including type errors
npm run typecheck             # tsc --noEmit
npx oxfmt --check             # formatting (npm run format fixes it)
VERCEL=1 npm run build:vercel # the production build used on Vercel
npm run test:e2e              # browser tests against that build
```

All checks must pass; CI runs the same ones. The browser tests use
Playwright with Chromium (`npx playwright install chromium` once). For
interface changes, also describe in the pull request what you tried by
hand (desktop and, if relevant, a phone-sized window).

## Editing garden data

- Catalogue: [`lib/gardens.ts`](lib/gardens.ts). Visiting facts:
  [`lib/garden-visits.ts`](lib/garden-visits.ts). The comments at the top of
  each file explain the fields.
- Keep access, opening hours, entrance and participation as separate facts.
- Use `published` only for a concrete statement in the source; use
  `not-found` when you looked and the source does not publish it.
- `GARDEN_VISIT_CHECKED_AT` is the day all sources were last verified. Change
  it only after re-checking every source. For a single correction, state the
  date you checked in the pull request description.
- Run `npm test`; the tests check that every field exists in both languages,
  that sources are HTTPS URLs, and that an admitted gap is admitted in both
  languages.

## Interface strings

All interface text lives in [`lib/i18n.ts`](lib/i18n.ts). Add the English
string first; TypeScript will point to the missing Czech one. Count-dependent
strings are functions so that Czech plural forms work. Do not hard-code text
in components.

## Pull requests

- One topic per pull request, with a short description of what changed and
  why. Use the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).
- Commit messages in English, imperative mood ("Add", "Fix", "Translate").
- Keep the media licence in mind: new illustrations or audio must be yours to
  license under CC BY-NC-SA 4.0 (see [`LICENSE-ASSETS.md`](LICENSE-ASSETS.md))
  and their provenance goes into
  [`docs/visual-generation-prompts.md`](docs/visual-generation-prompts.md).
- Do not add dependencies for things a few lines of code can do.
- By contributing code you agree that it is released under the MIT licence of
  this repository.

## Questions

Open an issue or write to <martin@usnea.ngo>. Please follow the
[Code of Conduct](CODE_OF_CONDUCT.md).
