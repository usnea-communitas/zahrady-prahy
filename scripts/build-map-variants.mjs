/**
 * Phone versions of the map pictures, made from the originals:
 *
 * - the illustrated map in three vertical strips at full resolution: 0–30 %,
 *   30–70 % and 70–100 % of the width, overlapping by 2 px so no seam shows.
 *   A phone in portrait shows the map as high as the screen allows, so only
 *   the middle strip is needed first (components/map/MapArt.tsx);
 * - the map 960 and 1280 px wide (the original is 1672 px and 621 kB) for
 *   small phones held sideways, which show it about as wide as the screen;
 * - the animated tree cluster as WebP instead of PNG (165 kB → 27 kB).
 *
 * The originals stay as they are. Run after replacing one of them:
 *   node scripts/build-map-variants.mjs
 */
import path from 'node:path';

import sharp from 'sharp';

const map = path.resolve('public/map/prague-storybook-vltava-v6-wide.webp');
for (const width of [960, 1280]) {
  const target = path.resolve(
    `public/map/prague-storybook-vltava-v6-${width}.webp`,
  );
  // Resize first, then encode once, so the copy is not compressed twice.
  const resized = await sharp(map)
    .resize({ width, kernel: 'lanczos3' })
    .png()
    .toBuffer();
  const result = await sharp(resized)
    .webp({ quality: 75, effort: 6, smartSubsample: true })
    .toFile(target);
  console.log(
    `${path.relative(process.cwd(), target)}: ${result.width}×${result.height}, ${result.size} bytes`,
  );
}

// Must match MAP_ART_STRIPS in lib/map/art.ts.
const { width: mapWidth, height: mapHeight } = await sharp(map).metadata();
const cuts = [
  0,
  Math.round(mapWidth * 0.3),
  Math.round(mapWidth * 0.7),
  mapWidth,
];
const original = await sharp(map).png().toBuffer();
for (const [index, name] of ['left', 'centre', 'right'].entries()) {
  const left = Math.max(0, cuts[index] - 2);
  const right = Math.min(mapWidth, cuts[index + 1] + 2);
  const target = path.resolve(
    `public/map/prague-storybook-vltava-v6-strip-${name}.webp`,
  );
  const result = await sharp(original)
    .extract({ left, top: 0, width: right - left, height: mapHeight })
    .webp({ quality: 78, effort: 6, smartSubsample: true })
    .toFile(target);
  console.log(
    `${path.relative(process.cwd(), target)}: ${left}–${right} px, ${result.width}×${result.height}, ${result.size} bytes`,
  );
}

const tree = path.resolve('public/map/motion/tree-cluster-v1.png');
const treeTarget = tree.replace(/\.png$/, '.webp');
const treeResult = await sharp(tree)
  .webp({ quality: 85, alphaQuality: 100, effort: 6 })
  .toFile(treeTarget);
console.log(
  `${path.relative(process.cwd(), treeTarget)}: ${treeResult.width}×${treeResult.height}, ${treeResult.size} bytes`,
);
