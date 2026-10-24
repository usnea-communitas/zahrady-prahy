# Visual generation provenance

This file records how the project's illustrations and the soundscape were
made: the tool, the mode and the exact production prompt for each asset.
It exists so that the media's origin is transparent and reproducible. The
licence for all of these assets is in [`LICENSE-ASSETS.md`](../LICENSE-ASSETS.md)
(CC BY-NC-SA 4.0).

Intermediate working files (`work/`) and the tools' original output files
are deliberately not committed; only converted production assets live in
`public/`.

## Production Prague background

- Mode: built-in image generation, image edit.
- Input guide: `work/prague-storybook-river-guide.png`, created from the previous storybook artwork and the exact OpenStreetMap Vltava path in `lib/map/geometry.generated.ts`.
- Original generated file: kept outside the repository (the generation tool's local output folder); only the converted production asset is committed.
- Workspace production asset: `public/map/prague-storybook-vltava-v5.webp`.

Exact production prompt:

```text
EDIT THE SUPPLIED IMAGE IN PLACE. Preserve its exact 1672 × 941 canvas, warm richly detailed bird's-eye Prague storybook illustration, architecture, exaggerated recognizable landmarks, terracotta roofs, parks, fine ink, gouache and watercolor texture.

The thick neon path (cyan center, magenta outline, thin cream centerline) is a temporary editing guide and the only allowed route for the Vltava. Replace the entire neon guide cleanly with one natural continuous painted Vltava in exactly the same course, width, bends and top-to-bottom placement. Render it as deep teal-blue water with subtle pale glints, embankments, a few geographically plausible small islands and bridges. No neon color may remain.

At the same time, completely remove every pre-existing blue river, canal, channel, lake-like branch and water area that lies outside the neon guide. Seamlessly reconstruct those removed water regions as the neighboring dense Prague city, terracotta roof blocks, green parks, streets, rail areas or embankments, matching the surrounding illustration perfectly. There must be only one connected river in the final image, following the guide exactly. Do not preserve the old diagonal/forked river.

Move or redraw nearby buildings, bridges and landmarks only where necessary to accommodate the corrected river; keep their recognizable storybook character and the overall visual richness of the original. The result must look like the same beloved illustrated Prague map, not a technical map and not a new art style.

DO NOT ADD: text, labels, pins, UI, logos, legend, compass, border, boats, birds, people, neon, magenta, cyan guide marks, a second river, forked water, disconnected water branches, duplicated landmarks, photorealism, flat vector graphics, or empty washed-out areas.

OUTPUT: one seamless clean production plate at the same aspect ratio and crop, with the corrected Vltava as the sole watercourse.
```

## Production soundtrack

- Mode: Picsart generation using ElevenLabs Music v2, instrumental.
- Source generation: 30 seconds at 44.1 kHz stereo.
- Production master: a 4-second equal-power crossfade creates a seamless 26.04-second loop; the loop is repeated three times to reduce the frequency of browser loop boundaries.
- Workspace production assets: `public/audio/zahrady-nad-vltavou.m4a` and `public/audio/zahrady-nad-vltavou.mp3`.
- Final delivery: 78.12 seconds, AAC-LC/MP3 at 160 kb/s, approximately -20.9 LUFS integrated and -4.5 dBTP.

Exact production prompt:

```text
Create a seamless-loop instrumental soundscape for an illustrated interactive map of Prague community gardens. The feeling is a quiet sunlit morning when the city and its gardens slowly wake beside the Vltava: intimate, organic, kind, lightly magical, sophisticated rather than childish. Gentle botanical chamber ambient at 64 BPM in a soft flowing 6/8. A small memorable four-note motif appears sparsely on warm felt piano and airy clarinet, answered by very soft pizzicato viola and cello; add delicate harp harmonics, rare cimbalom-like droplets, muted marimba and brushed wooden seed percussion. Warm modal harmony with a subtle Bohemian character, calm and hopeful, with generous breathing room and no dramatic climax. This is a 30-second repeating web loop: begin immediately inside the established texture, no intro, no ending cadence; the final ambience, harmony and sustained texture must connect naturally back to the first beat for an inaudible repeat. Instrumental only. No vocals, no spoken word, no choir, no polka, no tourist cliché, no quotation or imitation of any existing Czech melody, no cinematic trailer swell, no heavy drums, no EDM, no lo-fi beat or vinyl crackle, no generic spa synth pad, no dark melancholy, no tension, no sharp bells, no dominant sound effects or birdsong.
```

## Wider Prague background

- Mode: built-in image generation, image edit/outpainting.
- Edit target: `public/map/prague-storybook-vltava-v5.webp`.
- Original generated file: kept outside the repository (`prague-storybook-vltava-zoomed-out-25pct-v1.png` in the owner's map-candidates folder); only the converted production asset is committed.
- Workspace production asset: `public/map/prague-storybook-vltava-v6-wide.webp`.

Exact production prompt:

```text
Use case: precise-object-edit
Asset type: 16:9 full-screen illustrated Prague map background
Primary request: Zoom the camera out approximately 25–30% by outpainting and extending the existing Prague scene on every edge. The entire current composition must remain recognizable and occupy roughly the central 70–75% of the new frame, while additional connected Prague neighborhoods, parks, gardens, streets, rooftops, and distant greenery become visible around all four sides.
Input images: Image 1 is the edit target and authoritative source for composition, geography, landmark design, palette, texture, and painting style.
Scene/backdrop: A broader bird’s-eye panorama of Prague, seamlessly extending the same city beyond the current crop.
Subject: Preserve the existing oversized recognizable Prague landmarks and the existing single geographically plausible Vltava course flowing through the center. Continue the surrounding urban fabric and greenery naturally beyond every original edge.
Style/medium: Exactly match the source image: warm, richly detailed, hand-painted storybook illustration with fine ink-like architectural detail, softly aged paper texture, harmonious ochre, terracotta, olive green, and deep blue palette; clearly illustrated, never photorealistic.
Composition/framing: Same 16:9 landscape aspect ratio. Camera 25–30% farther away. Preserve the full original center aggressively, without moving, replacing, duplicating, or materially redesigning its river, bridges, skyline, landmarks, or street pattern. Treat this primarily as seamless outward extension rather than reinterpretation. Fill the entire frame edge to edge with finished artwork; no blank, blurred, framed, faded, or empty borders.
Lighting/mood: Keep the same warm diffuse daylight and calm enchanting civic-garden atmosphere.
Constraints: one and only one continuous Vltava river; the same river remains central and geographically plausible; all existing major landmarks stay in their same relative positions and retain their distinctive oversized silhouettes; added areas must join seamlessly at every edge; consistent scale and aerial perspective; dense finished detail across the whole frame.
Avoid: labels, lettering, captions, symbols, pins, UI, buttons, borders, frames, watermarks, boats, birds, people as focal subjects, extra rivers, forked rivers, tributaries, duplicated landmarks, radically altered central composition, modern photorealism, empty margins, blur, collage seams.
```

## Animated tree cluster overlay

- Mode: built-in image generation, transparent sprite.
- Original generated file: kept outside the repository (the generation tool's local output folder); only the resized production asset is committed.
- Workspace production asset: `public/map/motion/tree-cluster-v1.png` (mechanically resized to 384 × 256 px, RGBA preserved).

Exact production prompt:

```text
Use case: background-extraction
Asset type: transparent animated overlay sprite for illustrated Prague map
Primary request: Create a compact isolated cluster of 3–5 leafy Prague park trees/canopies matching the reference map’s warm hand-painted storybook ink-and-gouache style and bird’s-eye/isometric perspective; natural asymmetry, trunk bases near bottom center, olive/moss/cypress greens, fine ink detail, aged watercolor texture, same light and palette.
Input image: style reference only, not an edit target.
Scene/backdrop: genuinely transparent alpha with clean edges; no ground rectangle.
Composition/framing: one coherent compact sprite, fully contained with no cropped canopy, viewed from the same high bird’s-eye/isometric perspective as the reference.
Constraints: no text, buildings, people, border, watermark, cropped canopy, cast-shadow plane, or opaque background. Preserve actual transparency around the isolated cluster.
```

## Garden preview atlas attempt and production fallback

- Mode: built-in image generation, new illustration atlas.
- Result: two attempts reached neither billing nor an output file; the style-reference edit endpoint and the no-reference generation endpoint both returned a network error.
- Production fallback: eight 900 × 320 WebP crops mechanically derived from `public/map/prague-storybook-vltava-v6-wide.webp`, centered on each garden's projected map position and animated with a slow camera drift in CSS.
- Workspace production assets: `public/gardens/metrofarm.webp`, `prales.webp`, `kotlaska.webp`, `troja.webp`, `mecislavka.webp`, `vidimova.webp`, `prokopka.webp`, and `velky-haj.webp`.

Exact canonical atlas prompt (the no-reference retry omitted only the sentence beginning `Input images:`):

```text
Use case: illustration-story
Asset type: production atlas of eight website garden-card thumbnails

Primary request: Create one single raster atlas at exactly 1536 × 1024 pixels, arranged as a strict 2-column × 4-row grid of exactly eight equal wide landscape garden scenes. The order is mandatory:
row 1 left MetroFarm Císařský ostrov | row 1 right Komunitní zahrada Prales;
row 2 left Kotlaska | row 2 right Komunitní zahrada Troja;
row 3 left Mečislavka | row 3 right Vidimova;
row 4 left Prokopka | row 4 right Velký háj.

Input images: Image 1 is a style, palette, brushwork, lighting, texture, and bird’s-eye perspective reference only; do not copy its Prague landmarks or city composition and do not edit it.

Grid/layout: perfectly straight rectangular crop boundaries; every cell has exactly the same dimensions and is a self-contained edge-to-edge wide scene that can later be cropped independently. Separate all columns and rows with precise, narrow, solid single-color warm cream gutters, approximately 12 pixels wide, color near #F2E6CF. Keep the gutters perfectly uniform and uninterrupted. No outer frame, no rounded corners, no borders inside scenes, no overlaps across gutters.

Style/medium: sophisticated hand-painted storybook cartography, fine sepia ink linework over aged watercolor and gouache, subtle paper grain, delicately exaggerated cute proportions, painterly but geographically believable garden layouts. Match Image 1’s muted warm natural palette, density of detail, soft golden daylight, and oblique high bird’s-eye/isometric perspective. All eight scenes must feel painted by the same illustrator in the same season and light.

Cell 1 — MetroFarm: spacious island urban farm; orderly in-ground vegetable rows mixed with individual beds; wood-chip paths; translucent hoop-house polytunnel; compost bays; sunflowers; a few tiny free-range hens and two small goats. Open, rustic, productive, airy.
Cell 2 — Prales: accessible eco-centre garden; multiple raised beds at different heights including wheelchair-height planting tables; a prominent long translucent communal polytunnel containing beds; open potato/onion field; rainwater barrels and a tidy compost corner. Clear, practical, woodland-edge atmosphere.
Cell 3 — Kotlaska: lush large garden in an old orchard with mature fruit-tree crowns; wooden raised beds; rustic small garden shelter and pergola; one simple round canvas yurt; hammock; log benches and a small natural sandbox; abundant herbs and flowers.
Cell 4 — Troja: relaxed family garden whose unmistakable focal point is one ivory canvas tipi; nearby tiny book-exchange hut, colorful raised beds, public compost bays, reuse shelf, wooden workbench and community noticeboard. Friendly handcrafted character, no written signs.
Cell 5 — Mečislavka: triangular Nusle courtyard enclosed by warm pale apartment façades and a green railway embankment; two huge mature ash trees dominate the center; many small wooden raised beds around the perimeter; pallet compost bays, white rainwater tank, pallet seating, one tree swing and small sandbox.
Cell 6 — Vidimova: dense green oasis amid restrained distant panel-housing blocks; a lively grid of many raised wooden beds; a small color-painted utility container with absolutely no lettering; blue rain barrels; child swing, sandbox and mud kitchen; compost boxes, wood store and intimate fire circle.
Cell 7 — Prokopka: sunny open lawn-and-gravel community garden at the edge of a school/residential district; neat rows of wooden raised planters; compact tool shed; a few young useful trees; a long shared table; housing blocks only as a soft distant backdrop. Calm, welcoming, uncluttered.
Cell 8 — Velký háj: broad meadow at the edge of a deep green forest; nine prominent raised beds plus in-ground growing strips; one shipping container painted with a purely abstract botanical mural without letters, attached timber pergola, seating and fire circle; flower meadow, young orchard, glass observation beehive and small horse paddock.

Composition/framing: each scene uses the same oblique high bird’s-eye angle and balanced wide framing; the garden identity must read immediately at thumbnail size; give every cell one clear distinctive focal element while retaining rich small detail.
Lighting/mood: gentle late-summer golden daylight, serene, botanical, inviting, quietly magical but realistic enough to recognize each place.
Color palette: moss, fern and olive greens; terracotta, ochre, warm wood, dusty blue accents; parchment cream and aged sepia ink.
Materials/textures: visible watercolor blooms, gouache foliage, fine hand-inked edges, timber grain, garden soil, gravel, translucent greenhouse film, soft atmospheric depth.

Constraints: exactly eight cells, exactly 2 columns and 4 rows, exact ordering, exact uniform cream gutters; no captions, no labels, no letters, no numbers, no logos, no signs with text, no UI, no icons, no badges, no map pins, no people in the foreground, no famous Prague landmarks, no river, no castle, no cathedral, no television tower, no watermark. Do not merge cells. Do not allow objects or paint to cross the cream gutters. Avoid photorealism, generic flat vector art, modern 3D rendering, harsh shadows, neon colors, and duplicate garden layouts.
```
