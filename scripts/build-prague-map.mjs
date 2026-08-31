import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const bounds = {
  west: 14.19,
  east: 14.688345737867333,
  south: 49.985,
  north: 50.165,
};
const zoom = 13;
const tileSize = 256;
const outputWidth = 1672;
const outputHeight = 941;
const tileCache = path.resolve('work/prague-tiles');
const referenceOutput = path.resolve('work/prague-reference.png');
const styledReferenceOutput = path.resolve('work/prague-reference-styled.webp');

function lonToTileX(lon) {
  return ((lon + 180) / 360) * 2 ** zoom;
}

function latToTileY(lat) {
  const radians = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) *
    2 ** zoom
  );
}

async function getTile(x, y) {
  const filename = path.join(tileCache, `${zoom}-${x}-${y}.png`);
  try {
    return await readFile(filename);
  } catch {
    const url = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ZahradyPrahy/1.0 (nonprofit map prototype)',
      },
    });
    if (!response.ok) {
      throw new Error(`Tile ${x}/${y} failed: ${response.status}`);
    }
    const data = Buffer.from(await response.arrayBuffer());
    await writeFile(filename, data);
    return data;
  }
}

await mkdir(tileCache, { recursive: true });

const westX = lonToTileX(bounds.west);
const eastX = lonToTileX(bounds.east);
const northY = latToTileY(bounds.north);
const southY = latToTileY(bounds.south);
const minTileX = Math.floor(westX);
const maxTileX = Math.floor(eastX);
const minTileY = Math.floor(northY);
const maxTileY = Math.floor(southY);
const columns = maxTileX - minTileX + 1;
const rows = maxTileY - minTileY + 1;

const composites = [];
for (let y = minTileY; y <= maxTileY; y += 1) {
  for (let x = minTileX; x <= maxTileX; x += 1) {
    composites.push({
      input: await getTile(x, y),
      left: (x - minTileX) * tileSize,
      top: (y - minTileY) * tileSize,
    });
  }
}

const mosaic = await sharp({
  create: {
    width: columns * tileSize,
    height: rows * tileSize,
    channels: 4,
    background: '#eef0e8',
  },
})
  .composite(composites)
  .png()
  .toBuffer();

const cropLeft = Math.round((westX - minTileX) * tileSize);
const cropTop = Math.round((northY - minTileY) * tileSize);
const cropWidth = Math.round((eastX - westX) * tileSize);
const cropHeight = Math.round((southY - northY) * tileSize);

const reference = await sharp(mosaic)
  .extract({
    left: cropLeft,
    top: cropTop,
    width: cropWidth,
    height: cropHeight,
  })
  .resize(outputWidth, outputHeight, { fit: 'fill', kernel: 'lanczos3' })
  .png()
  .toBuffer();

await writeFile(referenceOutput, reference);

// A reversible, geography-preserving art pass: richer botanical color,
// gentle ink definition and paper warmth. No geometry is invented or moved.
const stylized = await sharp(reference)
  .modulate({ saturation: 1.22, brightness: 1.01 })
  .linear(1.06, -6)
  .sharpen({ sigma: 0.55, m1: 0.45, m2: 1.2 })
  .tint('#fff2d6')
  .composite([
    {
      input: Buffer.from(`
        <svg width="${outputWidth}" height="${outputHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="3" seed="37"/>
              <feColorMatrix type="saturate" values="0"/>
              <feComponentTransfer><feFuncA type="table" tableValues="0 0.055"/></feComponentTransfer>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#fff5df" opacity="0.12"/>
          <rect width="100%" height="100%" filter="url(#grain)" opacity="0.34" style="mix-blend-mode:multiply"/>
        </svg>
      `),
      blend: 'soft-light',
    },
  ])
  .webp({ quality: 88, smartSubsample: true, effort: 6 })
  .toBuffer();

await writeFile(styledReferenceOutput, stylized);

console.log(
  JSON.stringify(
    {
      bounds,
      zoom,
      tiles: { columns, rows, minTileX, maxTileX, minTileY, maxTileY },
      referenceOutput,
      styledReferenceOutput,
      dimensions: `${outputWidth}x${outputHeight}`,
    },
    null,
    2,
  ),
);
