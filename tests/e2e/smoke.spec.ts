import { expect, test } from '@playwright/test';

import { collectErrors, openAtlas } from './atlas';

test('the atlas opens in English with all thirteen gardens', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await openAtlas(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle(/Gardens of Prague/);
  await expect(page.locator('.garden-marker')).toHaveCount(13);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Zahrady Prahy',
  );
  expect(errors).toEqual([]);
});

test('a shared link opens the garden with its sourced visiting facts', async ({
  page,
}) => {
  await openAtlas(page, '/?zahrada=kotlaska');
  const detail = page.locator('.garden-preview');
  await expect(detail).toBeVisible();
  await expect(detail.getByRole('heading', { level: 2 })).toHaveText(
    'Komunitní centrum a zahrada Kotlaska',
  );
  await expect(detail).toContainText('Sources checked 6 September 2026');
  await expect(detail.locator('.visit-sources a').first()).toHaveAttribute(
    'href',
    /^https:\/\//,
  );
});

test('a garden opens and closes with the keyboard alone', async ({ page }) => {
  await openAtlas(page);
  const marker = page.locator('.garden-marker').first();
  await marker.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.garden-preview')).toBeVisible();
  await expect(page.locator('.preview-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.garden-preview')).toHaveCount(0);
  await expect(marker).toBeFocused();
});

test('Czech is one switch away and is remembered', async ({ page }) => {
  await openAtlas(page);
  await page.getByRole('button', { name: /Čeština/ }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
  await expect(
    page.getByRole('textbox', { name: 'Hledat zahradu nebo čtvrť' }),
  ).toHaveAttribute('placeholder', 'Hledat zahradu nebo čtvrť…');
  await openAtlas(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('the page does not scroll sideways and a garden opens as a sheet', async ({
    page,
  }) => {
    await openAtlas(page, '/?zahrada=prales');
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const sheet = await page.locator('.garden-preview').boundingBox();
    expect(sheet?.width).toBe(390);
  });
});
