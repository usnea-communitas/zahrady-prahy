# Product

<!-- impeccable:product-schema 1 -->

> Drafted from what the owner said about the project and from the documentation in the repository. Check it and correct what does not fit.

## Platform

web

## Users

People who want to discover Prague's community gardens and urban nature on their own. Guided walks and workshops were not chosen as a goal; the atlas serves independent exploration. The interface is in English by default, with Czech fully available.

## Product Purpose

An illustrated interactive atlas of 13 Prague community gardens. A project of Usnea communitas, z. s., a Czech nonprofit association.

## Positioning

A storybook-style illustrated map of Prague in which every practical piece of visiting information is backed by a source and a verification date. Missing data is honestly shown as missing, never guessed.

## Operating Context

- Primarily desktop; a phone layout exists (`app/mobile.css`, fixes of 2026-09-23).
- Map, diacritics-insensitive search in both languages, category filters, shareable `?zahrada=` links (`?garden=` accepted as an alias).
- The soundscape starts only from the note button, never automatically.
- Language: English by default, Czech via the CS/EN switcher in the header or a link with `?lang=cs`; the choice is remembered in the browser (`zahrady.lang`), nothing is sent anywhere.

## Capabilities and Constraints

- Feedback and personal-data collection are switched off at the owner's request. The suggestion form stays honestly unavailable, with no false "sent" state.
- No database and no subscription.
- Catalogue: `lib/gardens.ts`. Practical visiting information: `lib/garden-visits.ts`, each fact with a source and a check date, in both languages. `not-found` means "no regular schedule found", not "closed".
- Garden positions on the illustration (`artPositions`) are editorial placements, not navigation. Links to a real map serve for the journey.
- Keyboard navigation, focus return and `aria-live` announcements are implemented and must be preserved.

## Brand Commitments

- The existing visual system is documented in `design/README.md` and `design/structured-*`. The illustrated Prague, the 13 garden illustrations, the music and the animation are preserved.
- Illustrations are artistic renderings, not documentary photographs, and are labelled as such.
- The footer keeps the transparency the owner asked for.
- "Zahrady Prahy" stays the brand name in both languages, with "Gardens of Prague" alongside it in English.

## Evidence on Hand

- Illustrations and maps in `public/`; provenance and prompts in `docs/visual-generation-prompts.md`; media licence in `LICENSE-ASSETS.md`.
- Verified visiting information (check date 6 September 2026).
- No testimonials, visitor quotes or statistics exist; do not invent them.

## Product Principles

1. Truthfulness over completeness: an admitted missing value is better than a guess.
2. The illustration is an experience, not a navigation layer.
3. Calm: nothing starts by itself, nothing collects data.
