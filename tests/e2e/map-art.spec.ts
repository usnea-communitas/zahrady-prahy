import { expect, test, type Page } from '@playwright/test';

import { openAtlas } from './atlas';

const ART = '/map/prague-storybook-vltava-v6';

/** Every version of the illustrated map the page downloads, with its size. */
function collectMapDownloads(page: Page) {
  const downloads: { path: string; bytes: number }[] = [];
  page.on('requestfinished', async (request) => {
    const path = new URL(request.url()).pathname;
    if (!path.startsWith(ART) || path.endsWith('-placeholder.webp')) return;
    downloads.push({
      path,
      bytes: (await request.sizes()).responseBodySize,
    });
  });
  return downloads;
}

const shownPicture = (page: Page) =>
  page
    .locator('img.map-art:not(.map-art-detail)')
    .evaluate((image: HTMLImageElement) => new URL(image.currentSrc).pathname);

// A phone's screen is as wide as its viewport; with a desktop screen size the
// emulated phone resolves width=device-width differently while preloading.
test.describe('on a phone', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    screen: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('the map starts as a light copy and the original follows the zoom', async ({
    page,
  }) => {
    const downloads = collectMapDownloads(page);
    await openAtlas(page);
    expect(await shownPicture(page)).toBe(`${ART}-1280.webp`);
    await expect.poll(() => downloads.length).toBe(1);
    expect(downloads[0].path).toBe(`${ART}-1280.webp`);
    expect(downloads[0].bytes).toBeLessThanOrEqual(220_000);
    await expect(page.locator('.map-art-detail')).toHaveCount(0);

    // One step closer enlarges the copy past its own pixels.
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect(page.locator('.map-art-detail.is-shown')).toHaveCount(1);
    expect(downloads.map((download) => download.path)).toContain(
      `${ART}-wide.webp`,
    );
  });

  test('a phone with fewer pixels gets the smaller copy', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 412, height: 823 },
      screen: { width: 412, height: 823 },
      deviceScaleFactor: 1.75,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const downloads = collectMapDownloads(page);
    await openAtlas(page);
    expect(await shownPicture(page)).toBe(`${ART}-960.webp`);
    await expect
      .poll(() => downloads.map((item) => item.path))
      .toEqual([`${ART}-960.webp`]);
    await context.close();
  });
});

test('a wide screen gets the original map and no copy', async ({ page }) => {
  const downloads = collectMapDownloads(page);
  await openAtlas(page);
  expect(await shownPicture(page)).toBe(`${ART}-wide.webp`);
  await expect
    .poll(() => downloads.map((item) => item.path))
    .toEqual([`${ART}-wide.webp`]);
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await page.waitForTimeout(300);
  await expect(page.locator('.map-art-detail')).toHaveCount(0);
});
