import { expect, test, type Page } from '@playwright/test';

import { openAtlas } from './atlas';

// Firefox has no mobile emulation; its phone pages keep their size and touch.
const firefox = process.env.BROWSER === 'firefox';

const ART = '/map/prague-storybook-vltava-v6';
const STRIPS = ['left', 'centre', 'right'].map(
  (name) => `${ART}-strip-${name}.webp`,
);

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

  test('the map comes in full-resolution strips, the middle one first', async ({
    page,
  }) => {
    const downloads = collectMapDownloads(page);
    await openAtlas(page);
    // Under the strips: the blurred placeholder, never the map itself.
    expect(await shownPicture(page)).toBe(`${ART}-placeholder.webp`);
    expect(downloads[0]?.path).toBe(`${ART}-strip-centre.webp`);
    await expect.poll(() => downloads[0].bytes).toBeDefined();
    expect(downloads[0].bytes).toBeLessThanOrEqual(220_000);
    await expect.poll(() => paths(downloads)).toEqual([...STRIPS].sort());

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
    expect(paths(downloads)).toEqual([`${ART}-960.webp`, `${ART}-wide.webp`]);
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
    expect(await shownPicture(page)).toBe(`${ART}-wide.webp`);
    await expect.poll(() => paths(downloads)).toEqual([`${ART}-wide.webp`]);
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.map-art-detail')).toHaveCount(0);
    expect(paths(downloads)).toEqual([`${ART}-wide.webp`]);
  });
