import { expect, test, type Page } from '@playwright/test';

import { openAtlas } from './atlas';

/**
 * Markers whose round core is outside the visible map stage or overlaps any
 * control (header, map controls, footer chips, postcard, seal).
 */
async function blockedMarkers(page: Page) {
  return page.evaluate(() => {
    const isShown = (element: Element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const controls = [
      ...document.querySelectorAll(
        '.map-header a, .map-header button, .map-header input, .map-navigation, .map-footer > *, .intro-card, .gallery-seal',
      ),
    ].filter(isShown);
    const stage = document.querySelector('.map-stage')?.getBoundingClientRect();
    if (!stage) return ['no map stage'];
    const bottom = Math.min(stage.bottom, window.innerHeight);
    const problems: string[] = [];
    for (const marker of document.querySelectorAll('.garden-marker')) {
      const name = marker.querySelector('.marker-label strong')?.textContent;
      const core = marker
        .querySelector('.marker-core')
        ?.getBoundingClientRect();
      if (!core) continue;
      if (
        core.left < stage.left ||
        core.right > stage.right ||
        core.top < stage.top ||
        core.bottom > bottom
      ) {
        problems.push(`${name}: outside the visible map`);
        continue;
      }
      const cover = controls.find((control) => {
        const rect = control.getBoundingClientRect();
        return (
          rect.left < core.right &&
          rect.right > core.left &&
          rect.top < core.bottom &&
          rect.bottom > core.top
        );
      });
      if (cover) problems.push(`${name}: under .${cover.className}`);
    }
    return problems;
  });
}

const sizes = [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
  [1366, 657],
  [1280, 800],
  [1280, 720],
  [1024, 768],
  [768, 1024],
  // a phone held sideways gets the phone layout with side panels
  [844, 390],
] as const;

for (const locale of ['en', 'cs'] as const) {
  test.describe(`in ${locale === 'en' ? 'English' : 'Czech'}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((choice) => {
        localStorage.setItem('zahrady.lang', choice);
      }, locale);
    });

    for (const [width, height] of sizes) {
      test(`no garden marker sits under a control at ${width}×${height}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height });
        await openAtlas(page);
        expect(await blockedMarkers(page)).toEqual([]);
      });
    }
  });
}

test('no visible text is smaller than 12 px, also in a low window', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 657 });
  await openAtlas(page, '/?zahrada=kotlaska');
  const tooSmall = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((element) =>
        [...element.childNodes].some(
          (node) =>
            node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        ),
      )
      .filter((element) => {
        if (element.closest('.sr-only, [hidden], [aria-hidden="true"]'))
          return false;
        const style = getComputedStyle(element);
        return (
          style.visibility !== 'hidden' &&
          element.getBoundingClientRect().width > 0 &&
          parseFloat(style.fontSize) < 12
        );
      })
      .map((element) => element.textContent?.trim().slice(0, 40)),
  );
  expect(tooSmall).toEqual([]);
});
