# Desktop atlas revision — 2026-09-06

## Scope

Preserves the supplied palette, illustrated Prague, 13 garden illustrations, music and motion. Suggestions and personal-data collection are deliberately disabled at the owner's request. No database, subscription or new generated media was provisioned.

## Data conventions

- `lib/gardens.ts` is the catalogue and shared search/filter logic.
- `lat` / `lon` remain the original public-source coordinates. They are not newly surveyed or independently verified entrances.
- `artPositions` are editorial placements on the `storybook-v6-wide` illustration. The illustration compresses outlying districts and does not depict every neighbourhood/island; these positions must never be used for navigation. The interface labels this explicitly.
- Practical visit facts live in `lib/garden-visits.ts`. Every fact carries a source and the date it was checked. `published` is used only for a concrete statement in that source; `not-found` explicitly means that a regular schedule was not found and does not mean that a garden is closed.
- Garden access, wider-site opening hours, entrance orientation and membership/volunteer times are kept as separate facts. This prevents (for example) Prales site hours or MetroFarm's billing address from being presented as the garden's own entrance hours.
- Illustrations are labelled as artistic impressions. Do not present them as documentary photographs.

## Implemented

- Accent-insensitive multiword search, repaired compost tag and category assignments.
- Visible illustrated results, interactive category legend, geographic map links and shareable `?zahrada=` URLs.
- Fit-to-screen atlas, bounded zoom/pan and equivalent keyboard controls.
- Device-local postcard geometry preference, smaller unobtrusive default and uncropped framing.
- SVG boat corridor changed from a stroked clipPath to a luminance mask.
- Honest pending-suggestions dialog, with no form or false success state.
- Source-backed visit panel in each garden detail: “Visiting”, “When to come”, “Access”, optional location/participation notes, check date and direct source links. Missing schedules are shown honestly instead of guessed.
- Scrollable detail panel so longer visit notes and source links remain reachable above the glass footer.
- Focus return now goes to the list item that opened a garden (with the marker as fallback). Fullscreen failure is announced through an `aria-live` status instead of failing silently.
- Feature-detected read-only WebMCP catalogue search. No supported browser WebMCP validation context was used; do not claim its integration was verified.

## Verification and remaining checks

Run `npm test`, `npx tsc --noEmit`, and the relevant deployment build. Targeted lint covers authored files; the repository-wide lint also includes pre-existing issues in vendored `components/ui` which were intentionally not modified.

Desktop browser QA performed at 1440 × 900: maximum zoom, Prales/Prokopka selection across opposite map edges with both panels open, selected labels remaining visible, manual keyboard pan followed by repeat reveal without URL changes, accent-insensitive LIBÓZA search, and Back restoring the previous search. Postcard keyboard movement/resize was exercised; the changed geometry remained visually present after reload, but numeric remeasurement after reload was unavailable. Boat screenshots show complete sprites on the river at sampled moments, not a verified full cycle. Pointer drag, clipboard fallback and complete boat cycles remain to be checked. Unit tests cover catalogue/search/navigation invariants and viewport bounds, not visual river-bank accuracy.

Selection/camera behavior was reviewed with Astra Ultra: preserve zoom, reveal the selected marker inside the unobstructed area, do not override subsequent manual panning, and keep camera motion out of URL history. Search/category/feature filters now round-trip through the URL together; shared garden links intentionally omit the sender's filters.

Next independent increments: periodic source refresh (the current check date is 6 September 2026); approved suggestions with private moderation when the owner enables storage; curated walking routes based on verified public access. Mobile remains deferred.

## Fixes — 2026-09-23

- The soundscape starts only from the note button (no autoplay and no start on the first click anywhere); the audio element has `preload="none"`.
- Minimising or moving the postcard no longer shifts the map (the title row reserves its space).
- The postcard is a 107 kB WebP instead of a 1.8 MB PNG; the social preview is a 239 kB JPEG.
- While the illustrated map loads, a blurred 1.5 kB preview and a "Loading the map…" notice are shown.
- Phone layout (≤ 720 px, `app/mobile.css`): the map fills the screen, the garden detail and the list open as bottom sheets, the "Open in a map" button stays within reach at the bottom, the selected garden stays above the sheet; in portrait the map opens zoomed in and is panned by dragging.
- Clean-up: removed unused maps (`prague-garden-map.webp`, `map/prague-illustrated-v2.webp`), unused `components/ui` components and dependencies (recharts, date-fns, cmdk, embla, input-otp, react-day-picker, react-resizable-panels, @shadcn/react).

## Localisation — 2026-10-24

- English is the default interface language; Czech is available through the CS/EN switcher in the header and remembered in the browser (`localStorage` key `zahrady.lang`). See `lib/i18n.ts` and `components/i18n/`.
- Catalogue content (`lib/gardens.ts`, `lib/garden-visits.ts`) is bilingual at the data level; garden names, neighbourhoods and street addresses stay in Czech as proper nouns. Where the Czech admits a gap, the English admits the same gap.
- Share links keep `?zahrada=`; `?garden=` is accepted as an alias.
