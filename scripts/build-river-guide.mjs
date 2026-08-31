import { readFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const geometrySource = await readFile(
  path.resolve('lib/map/geometry.generated.ts'),
  'utf8',
);
const pathMatch = geometrySource.match(
  /VLTAVA_CENTERLINE_PATH\s*=\s*\n?\s*"([^"]+)"/,
);

if (!pathMatch) {
  throw new Error('Vltava centerline path was not found.');
}

const guide = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941">
    <path d="${pathMatch[1]}" fill="none" stroke="#ff1fcf" stroke-width="76" stroke-linecap="round" stroke-linejoin="round" opacity="0.94" />
    <path d="${pathMatch[1]}" fill="none" stroke="#1ff5ff" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" opacity="0.96" />
    <path d="${pathMatch[1]}" fill="none" stroke="#fff8d9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.94" />
  </svg>
`);

const result = await sharp(
  path.resolve('work/prague-storybook-river-seedream.jpg'),
)
  .resize(1672, 941, { fit: 'fill' })
  .composite([{ input: guide }])
  .png()
  .toFile(path.resolve('work/prague-storybook-river-guide.png'));

console.log(
  `work/prague-storybook-river-guide.png: ${result.width}×${result.height}, ${result.size} bytes`,
);
