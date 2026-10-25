/**
 * Small square thumbnails for the garden list, cut from the illustrations.
 * The list shows them as 56 px circles; 144 px keeps them sharp on
 * high-density screens while weighing a few kilobytes instead of ~200 kB.
 *
 * Run after adding or replacing an illustration:
 *   node scripts/build-thumbnails.mjs
 */
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const sourceDirectory = path.resolve('public/gardens');
const outputDirectory = path.resolve('public/gardens/thumbnails');
const size = 144;

await mkdir(outputDirectory, { recursive: true });

const illustrations = (await readdir(sourceDirectory))
  .filter((file) => file.endsWith('-illustrated.webp'))
  .sort();

for (const file of illustrations) {
  const id = file.replace(/-illustrated\.webp$/, '');
  const target = path.join(outputDirectory, `${id}.webp`);
  const { size: bytes } = await sharp(path.join(sourceDirectory, file))
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .webp({ quality: 74, effort: 6 })
    .toFile(target);
  console.log(`${path.relative(process.cwd(), target)}  ${bytes} B`);
}
