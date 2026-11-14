import { expect, test, type Page } from '@playwright/test';

import { ONE_PIXEL_AVIF } from '../../lib/map/art';
import { openAtlas } from './atlas';

// Firefox has no mobile emulation; its phone pages keep their size and touch.
const firefox = process.env.BROWSER === 'firefox';

const ART = '/map/prague-storybook-vltava-v6';

/**
 * The strips and the original come in AVIF and WebP (Z-13): a browser that
 * can show AVIF must take it. Asked of the page with a one-pixel AVIF.
 */
async function pictureType(page: Page) {
  const avif = await page.evaluate(
    (source) =>
      new Promise<boolean>((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image.width === 1);
        image.onerror = () => resolve(false);
        image.src = source;
      }),
    ONE_PIXEL_AVIF,
  );
  return avif ? 'avif' : 'webp';
}
const stripFiles = (type: string) =>
  ['left', 'centre', 'right'].map((name) => `${ART}-strip-${name}.${type}`);

/** Every version of the illustrated map the page asks for, in that order. */
function collectMapDownloads(page: Page) {
  const downloads: { path: string; bytes?: number }[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith(ART) && !path.endsWith('-placeholder.webp'))
      downloads.push({ path });
  });
  page.on('requestfinished', async (request) => {
    const path = new URL(request.url()).pathname;
    const download = downloads.find((item) => item.path === path);
    if (download) download.bytes = (await request.sizes()).responseBodySize;
  });
  return downloads;
}
const paths = (downloads: { path: string }[]) =>
  downloads.map((download) => download.path).sort();

/** The file the main map picture shows. */
const shownPicture = (page: Page) =>
  page
    .locator('img.map-art:not(.map-art-detail)')
    .evaluate((image: HTMLImageElement) => new URL(image.currentSrc).pathname);

// A phone's screen is as wide as its viewport; with a desktop screen size the
// emulated phone resolves width=device-width differently while preloading.
const phone = (width: number, height: number, deviceScaleFactor: number) => ({
  viewport: { width, height },
  screen: { width, height },
  deviceScaleFactor,
  isMobile: !firefox,
  hasTouch: true,
});

test.describe('on a phone in portrait', () => {
  test.use(phone(390, 844, 3));

  test('the map comes in full-resolution strips, the sides once the map moves', async ({
    page,
    browserName,
  }) => {
    const downloads = collectMapDownloads(page);
    await openAtlas(page);
    // Under the strips: the blurred placeholder, never the map itself.
    expect(await shownPicture(page)).toBe(`${ART}-placeholder.webp`);
    const type = await pictureType(page);
    const STRIPS = stripFiles(type);
    expect(downloads[0]?.path).toBe(`${ART}-strip-centre.${type}`);
    await expect.poll(() => downloads[0].bytes).toBeDefined();
    expect(downloads[0].bytes).toBeLessThanOrEqual(
      type === 'avif' ? 150_000 : 220_000,
    );
    // The middle strip fills this phone's first view, so the side strips wait
    // until a part of them comes into view or the map is touched (chosen on
    // 14 November 2026); the placeholder shows there until then.
    await page.waitForTimeout(1500);
    expect(paths(downloads)).toEqual([`${ART}-strip-centre.${type}`]);
    await expect(page.locator('.map-art-strip-slot')).toHaveCount(2);

    // A key on the map moves it, and the side strips follow (WebKit without
    // a graphics card has about one frame a second, docs/BROWSERS.md).
    await page.locator('.map-plane').focus();
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => paths(downloads), {
        timeout: browserName === 'webkit' ? 20_000 : 5_000,
      })
      .toEqual([...STRIPS].sort());
    await expect(page.locator('.map-art-strip-slot')).toHaveCount(0);

    // The strips meet without a gap and together cover the whole map.
    const plane = await page.locator('.map-plane').boundingBox();
    const strips = await page
      .locator('.map-art-strip')
      .evaluateAll((images) =>
        images.map((image) => image.getBoundingClientRect().toJSON()),
      );
    expect(strips).toHaveLength(3);
    expect(strips[0].left).toBeCloseTo(plane!.x, 0);
    expect(strips[2].right).toBeCloseTo(plane!.x + plane!.width, 0);
    for (const strip of strips) {
      expect(strip.top).toBeCloseTo(plane!.y, 0);
      expect(strip.height).toBeCloseTo(plane!.height, 0);
    }
    expect(strips[0].right).toBeGreaterThan(strips[1].left);
    expect(strips[1].right).toBeGreaterThan(strips[2].left);

    // They hold the original's pixels, so zooming in needs nothing more.
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.map-art-detail')).toHaveCount(0);
    expect(paths(downloads)).toEqual([...STRIPS].sort());
  });
});

test.describe('on a 16 : 9 phone in portrait', () => {
  test.use(phone(360, 640, 2));

  test('the side strips are in the first view, so they come at once', async ({
    page,
    browserName,
  }) => {
    const downloads = collectMapDownloads(page);
    await openAtlas(page);
    const STRIPS = stripFiles(await pictureType(page));
    await expect
      .poll(() => paths(downloads), {
        timeout: browserName === 'webkit' ? 20_000 : 5_000,
      })
      .toEqual([...STRIPS].sort());
    await expect(page.locator('.map-art-strip')).toHaveCount(3);
  });
});

test.describe('on a small phone held sideways', () => {
  test.use(phone(667, 375, 2));

  test('the map starts as a light copy and the original follows the zoom', async ({
    page,
  }) => {
    const downloads = collectMapDownloads(page);
    await openAtlas(page);
    expect(await shownPicture(page)).toBe(`${ART}-960.webp`);
    await expect.poll(() => paths(downloads)).toEqual([`${ART}-960.webp`]);
    await expect.poll(() => downloads[0].bytes).toBeDefined();
    expect(downloads[0].bytes).toBeLessThanOrEqual(220_000);
    await expect(page.locator('.map-art-detail')).toHaveCount(0);

    // One step closer enlarges the copy past its own pixels.
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect(page.locator('.map-art-detail.is-shown')).toHaveCount(1);
    expect(paths(downloads)).toEqual([
      `${ART}-960.webp`,
      `${ART}-wide.${await pictureType(page)}`,
    ]);
  });

  test('a phone with more pixels gets the larger copy', async ({ browser }) => {
    const context = await browser.newContext(phone(667, 375, 3));
    const page = await context.newPage();
    const downloads = collectMapDownloads(page);
    await openAtlas(page);
    expect(await shownPicture(page)).toBe(`${ART}-1280.webp`);
    await expect.poll(() => paths(downloads)).toEqual([`${ART}-1280.webp`]);
    await context.close();
  });
});

for (const [width, height] of [
  [1440, 900],
  [768, 1024],
] as const)
  test(`a wide screen gets the original map and nothing else at ${width}×${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const downloads = collectMapDownloads(page);
    await openAtlas(page);
    const wide = `${ART}-wide.${await pictureType(page)}`;
    expect(await shownPicture(page)).toBe(wide);
    await expect.poll(() => paths(downloads)).toEqual([wide]);
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.map-art-detail')).toHaveCount(0);
    expect(paths(downloads)).toEqual([wide]);
  });

test('Chromium takes the AVIF map', async ({ page, browserName }) => {
  test.skip(
    browserName !== 'chromium',
    'the other engines take what they can show',
  );
  expect(await pictureType(page)).toBe('avif');
});
