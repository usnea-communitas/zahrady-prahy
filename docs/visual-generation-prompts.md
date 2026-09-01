# Visual generation provenance

## Production Prague background

- Mode: built-in image generation, image edit.
- Input guide: `work/prague-storybook-river-guide.png`, created from the previous storybook artwork and the exact OpenStreetMap Vltava path in `lib/map/geometry.generated.ts`.
- Original generated file: `C:/Users/marti/.codex/generated_images/01a05212-8f96-7fc1-8602-4ca6bbf902da/exec-71005987-d02a-4a11-8494-347646d87b43.png`.
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
- Original generated file: `C:/Users/marti/OneDrive/Dokumenty/ChatGPT/Neziskovka Usnea/map-candidates/prague-storybook-vltava-zoomed-out-25pct-v1.png`.
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
