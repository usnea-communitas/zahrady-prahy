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
