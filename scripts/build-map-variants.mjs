/**
 * Lighter copies of the map pictures for phones, made from the originals:
 *
 * - the illustrated map, 960 and 1280 px wide (the original is 1672 px and
 *   621 kB). A phone in portrait shows the map about as wide as its screen, so
 *   it starts with the copy that matches its pixel density and lays the
 *   original over it only once the map is zoomed in (components/map/MapArt.tsx);
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

const tree = path.resolve('public/map/motion/tree-cluster-v1.png');
const treeTarget = tree.replace(/\.png$/, '.webp');
const treeResult = await sharp(tree)
  .webp({ quality: 85, alphaQuality: 100, effort: 6 })
  .toFile(treeTarget);
console.log(
  `${path.relative(process.cwd(), treeTarget)}: ${treeResult.width}×${treeResult.height}, ${treeResult.size} bytes`,
);
