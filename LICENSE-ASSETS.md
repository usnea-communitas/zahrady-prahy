# Licence for illustrations, map artwork and audio

The source code of this repository is released under the MIT licence
(see [`LICENSE`](LICENSE)). The **media files are not**: they are licensed
separately, as described here.

## What this covers

All creative media in `public/`:

- the illustrated map of Prague (`public/map/*.webp`),
- the animated overlay sprites (`public/map/motion/*`),
- the thirteen garden illustrations (`public/gardens/*.webp`),
- the postcard and social preview image (`public/zahrady-prahy-postcard.webp`,
  `public/zahrady-prahy-og.jpg`),
- the soundscape "Zahrady nad Vltavou" (`public/audio/*`).

It also covers the production prompts and provenance notes in
[`docs/visual-generation-prompts.md`](docs/visual-generation-prompts.md),
which are part of the same creative work.

It does **not** cover `public/favicon.svg`, a generic placeholder icon from
the project scaffold, nor any third-party fonts the build downloads and
self-hosts (Playfair Display, Inter and JetBrains Mono are distributed under
the SIL Open Font License by their respective authors).

## Licence

Copyright (c) 2026 Martin Pazderník.

These media files are licensed under the
**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International**
licence (CC BY-NC-SA 4.0):
<https://creativecommons.org/licenses/by-nc-sa/4.0/>

In short, you may share and adapt them, provided that you

- **give attribution** — credit "Zahrady Prahy / Martin Pazderník, Usnea
  communitas, z. s." and link to <https://zahrady-prahy.vercel.app>,
- use them **non-commercially**, and
- **share alike** — distribute any adaptation under the same licence.

If you want to use the artwork commercially, write to <martin@usnea.ngo>.

## Provenance

The media were produced for this project in August and September 2026 with
AI generation tools, from prompts written for the project, and were then
edited and converted by hand. The exact prompts, the tools and each
intermediate step are recorded in
[`docs/visual-generation-prompts.md`](docs/visual-generation-prompts.md).
In brief:

| Asset | How it was made |
| --- | --- |
| Illustrated map of Prague (`map/prague-storybook-vltava-v5.webp`, `-v6-wide.webp`) | Image generation and image editing built into the Codex/ChatGPT environment (OpenAI image generation), guided by the real course of the Vltava from OpenStreetMap data, then outpainted to a wider frame. |
| Blurred map placeholder (`-v6-placeholder.webp`) | Mechanically derived from the wide map. |
| Animated tree cluster sprite (`map/motion/tree-cluster-v1.png`) | OpenAI image generation (transparent sprite), mechanically resized. |
| Boat and bird sprites (`map/motion/*.webp`) | Cut from a sprite atlas created with Picsart and converted by `scripts/build-motion-sprites.mjs`. |
| Garden map crops (`gardens/<id>.webp`, eight files) | Mechanical crops of the wide map centred on each garden's position, kept as a fallback; the interface uses the illustrated versions. |
| Garden illustrations (`gardens/*-illustrated.webp`, thirteen files), postcard and social preview | AI-generated illustrations in the same storybook style, added on 4 September 2026; the individual prompts and tool were not recorded in the provenance notes. They are artistic renderings of real places, not documentary pictures. |
| Soundscape "Zahrady nad Vltavou" (`audio/*`) | Generated with ElevenLabs Music v2 through Picsart, instrumental, then looped and mastered. |

The river geometry in `lib/map/geometry.generated.ts` is derived from
OpenStreetMap data, © OpenStreetMap contributors, available under the
Open Database License (ODbL); the application credits this in its footer.

## Why a separate licence

The illustrations are artistic renderings of real places and the heart of
the project's character. Keeping them under a share-alike, non-commercial
licence lets others learn from and build on the project while keeping the
artwork from being lifted into unrelated commercial products. The code is
free to reuse under MIT, with or without the artwork.
