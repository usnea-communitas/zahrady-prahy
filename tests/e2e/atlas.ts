import { expect, type Page } from '@playwright/test';

/** Opens the atlas and waits until the illustrated map has loaded. */
export async function openAtlas(page: Page, path = '/') {
  await page.goto(path);
  await expect(page.locator('.map-loading')).toHaveCount(0);
  await expect(page.locator('.garden-marker').first()).toBeVisible();
}

/** Collects console errors and uncaught exceptions for the whole test. */
export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

// Known differences of the engines (S-17, docs/BROWSERS.md). WebKit without a
// graphics card (CI, containers) draws the map and the garden panel in
// software and gets one or two frames a second, so the tests that wait for
// motion to settle or for focus to come back time out there; real Safari
// draws them on the graphics card. To check on a real Mac or iPhone (H4).
export const WEBKIT_WITHOUT_GPU =
  'WebKit without a graphics card gets about one frame a second on the map; check on a real Mac or iPhone (docs/BROWSERS.md)';
// Firefox in Playwright cannot send two-finger touches.
export const FIREFOX_TOUCH =
  'Playwright cannot send two-finger touches to Firefox (docs/BROWSERS.md)';
