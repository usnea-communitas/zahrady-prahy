import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const source = path.resolve('work/picsart-sprite-atlas.jpg');
const outputDirectory = path.resolve('public/map/motion');

const sprites = [
  {
    name: 'boat-ochre',
    crop: { left: 245, top: 145, width: 175, height: 330 },
    width: 70,
  },
  {
    name: 'boat-brick',
    crop: { left: 605, top: 155, width: 200, height: 330 },
    width: 78,
  },
  {
    name: 'birds-three',
    crop: { left: 225, top: 565, width: 230, height: 200 },
    width: 138,
  },
  {
    name: 'birds-two',
    crop: { left: 620, top: 580, width: 220, height: 175 },
    width: 126,
  },
];

await mkdir(outputDirectory, { recursive: true });

const { data: rgb, info } = await sharp(source)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const rgba = Buffer.alloc(info.width * info.height * 4);

for (let index = 0; index < info.width * info.height; index += 1) {
  const sourceOffset = index * 3;
  const targetOffset = index * 4;
  const red = rgb[sourceOffset];
  const green = rgb[sourceOffset + 1];
  const blue = rgb[sourceOffset + 2];
  const lightest = Math.min(red, green, blue);
  const alpha =
    lightest > 252 ? 0 : lightest > 238 ? (252 - lightest) * 18 : 255;

  rgba[targetOffset] = red;
  rgba[targetOffset + 1] = green;
  rgba[targetOffset + 2] = blue;
  rgba[targetOffset + 3] = alpha;
}

for (const sprite of sprites) {
  const output = path.join(outputDirectory, `${sprite.name}.webp`);
  const cropped = await sharp(Buffer.from(rgba), {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .extract(sprite.crop)
    .png()
    .toBuffer();
  const result = await sharp(cropped)
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .resize({ width: sprite.width, withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(output);
  console.log(
    `${sprite.name}: ${result.width}×${result.height}, ${result.size} bytes`,
  );
}
