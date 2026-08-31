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
