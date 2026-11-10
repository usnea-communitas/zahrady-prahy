# Changelog

Notable changes to Zahrady Prahy (Gardens of Prague). The version lives in
`package.json`; each version is also a
[GitHub release](https://github.com/usnea-communitas/zahrady-prahy/releases).

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
