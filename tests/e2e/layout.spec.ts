import { expect, test, type Page } from '@playwright/test';

import { openAtlas } from './atlas';

/**
 * Where each garden marker's round core is: fully on the visible map stage
 * ('shown'), beside it to the left or right ('beside'), above or below it
 * ('outside'), or under a control (header, map controls, footer chips,
 * postcard, seal).
 */
async function markerPlaces(page: Page) {
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
    if (!stage) return [{ name: 'no map stage', place: 'outside' }];
    const bottom = Math.min(stage.bottom, window.innerHeight);
    const places: { name: string; place: string }[] = [];
    for (const marker of document.querySelectorAll('.garden-marker')) {
      const name =
        marker.querySelector('.marker-label strong')?.textContent ?? '';
      const core = marker
        .querySelector('.marker-core')
        ?.getBoundingClientRect();
      if (!core) continue;
      if (core.top < stage.top || core.bottom > bottom) {
        places.push({ name, place: 'outside' });
        continue;
      }
      if (core.left < stage.left || core.right > stage.right) {
        places.push({ name, place: 'beside' });
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
      places.push({
        name,
        place: cover ? `under .${cover.className}` : 'shown',
      });
    }
    return places;
  });
}

/**
 * Markers outside the visible map stage or under a control. A phone in
 * portrait pans the map sideways, so there a marker beside the stage is fine.
 */
async function blockedMarkers(page: Page, { pansSideways = false } = {}) {
  return (await markerPlaces(page))
    .filter(
      ({ place }) => place !== 'shown' && !(pansSideways && place === 'beside'),
    )
    .map(({ name, place }) =>
      place === 'beside' || place === 'outside'
        ? `${name}: outside the visible map`
        : `${name}: ${place}`,
    );
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
  // a phone in portrait: the map fills the height between the header and the
  // controls and pans sideways
  [390, 844],
  [360, 740],
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
        expect(
          await blockedMarkers(page, {
            pansSideways: width < height && width <= 720,
          }),
        ).toEqual([]);
      });
    }
  });
}

test.describe('on a phone in portrait', () => {
  for (const [width, height] of [
    [390, 844],
    [360, 740],
    [320, 568],
  ] as const)
    test(`the map fills the height and panning reaches every garden at ${width}×${height}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await openAtlas(page);
      const fit = await page.evaluate(() => {
        const rect = (selector: string) =>
          document.querySelector(selector)!.getBoundingClientRect();
        const stage = rect('.map-stage');
        const plane = rect('.map-plane');
        const controls = rect('.map-navigation');
        return {
          top: plane.top - stage.top,
          bottom: stage.bottom - plane.bottom,
          widths: plane.width / stage.width,
          aboveControls: controls.top - stage.bottom,
        };
      });
      expect(Math.abs(fit.top)).toBeLessThan(1);
      expect(Math.abs(fit.bottom)).toBeLessThan(1);
      // about two to three screens wide
      expect(fit.widths).toBeGreaterThan(1.8);
      expect(fit.aboveControls).toBeGreaterThanOrEqual(0);

      // At the left end, in the middle and at the right end together, every
      // garden is shown clear of the controls at least once.
      const shown = new Set<string>();
      const look = async () => {
        for (const { name, place } of await markerPlaces(page))
          if (place === 'shown') shown.add(name);
      };
      await look();
      const plane = page.locator('.map-plane');
      await plane.focus();
      for (const key of ['ArrowLeft', 'ArrowRight']) {
        for (let step = 0; step < 16; step += 1) await plane.press(key);
        await look();
      }
      expect(shown.size).toBe(await page.locator('.garden-marker').count());
    });

  test('the map stands where it will before the app script runs', async ({
    browser,
  }) => {
    const planes: number[][] = [];
    for (const app of [false, true]) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      if (!app)
        await page.route('**/assets/hydrate-*.js', (route) => route.abort());
      await page.goto('/');
      await expect(page.locator('.map-plane')).toHaveClass(
        app ? /is-placed/ : /^map-plane$/,
      );
      const box = (await page.locator('.map-plane').boundingBox())!;
      planes.push([box.x, box.y, box.width, box.height].map(Math.round));
      await page.close();
    }
    expect(planes[0]).toEqual(planes[1]);
  });
});

/** Whether the detail's close button covers its picture caption or any text. */
async function closeButtonCover(page: Page) {
  return page.evaluate(() => {
    const rect = (selector: string) =>
      document.querySelector(selector)?.getBoundingClientRect();
    const close = rect('.preview-close');
    const scroll = rect('.preview-scroll');
    const bar = document.querySelector('.preview-bar');
    if (!close || !scroll || !bar) return ['no detail'];
    const under = (other?: DOMRect) =>
      !!other &&
      other.left < close.right &&
      other.right > close.left &&
      other.top < close.bottom &&
      other.bottom > close.top;
    const problems: string[] = [];
    if (under(rect('.garden-preview .illustration-caption')))
      problems.push('caption');
    // Text under the button is fine only while the bar hides it.
    if (Number(getComputedStyle(bar).opacity) < 1)
      for (const element of document.querySelectorAll('.preview-body *')) {
        const hasText = [...element.childNodes].some(
          (node) =>
            node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        );
        const box = element.getBoundingClientRect();
        if (hasText && box.bottom > scroll.top && under(box))
          problems.push(element.textContent?.trim().slice(0, 30) ?? '');
      }
    return problems;
  });
}

for (const [width, height] of [
  [1440, 900],
  [1366, 657],
  [844, 390],
  [390, 844],
] as const) {
  test(`the close button never covers the garden text at ${width}×${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await openAtlas(page, '/?zahrada=kotlaska');
    expect(await closeButtonCover(page)).toEqual([]);
    await page
      .locator('.preview-scroll')
      .evaluate((element) => element.scrollTo(0, element.scrollHeight));
    await expect(page.locator('.preview-bar')).toHaveCSS('opacity', '1');
    expect(await closeButtonCover(page)).toEqual([]);
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

test.describe('on short phones', () => {
  for (const [width, height] of [
    [320, 568],
    [360, 640],
    [390, 844],
  ] as const)
    test(`a selected garden and both lines of its label stay above the sheet at ${width} × ${height}`, async ({
      browser,
    }) => {
      const page = await browser.newPage({
        viewport: { width, height },
        isMobile: true,
        hasTouch: true,
      });
      for (const id of ['prales', 'liboza', 'na-polske']) {
        await openAtlas(page, `/?zahrada=${id}`);
        await expect(page.locator('.garden-preview')).toBeVisible();
        // The sheet slides up and the map pans to the garden: judge where they settle.
        await expect
          .poll(
            () =>
              page.evaluate(() => {
                const rect = (selector: string) =>
                  document.querySelector(selector)?.getBoundingClientRect() ??
                  null;
                const header = rect('.map-header')?.bottom ?? 0;
                const marker = rect('.garden-marker.is-selected .marker-core');
                const label = rect(
                  '.garden-marker.is-selected .marker-label small',
                );
                const sheet = rect('.garden-preview')?.top ?? 0;
                const title = rect('.garden-preview .preview-body h2')?.bottom;
                const actions = rect('.garden-preview .preview-actions')?.top;
                const problems = [];
                if (!marker || marker.top < header)
                  problems.push('marker under the header');
                if (!label || label.bottom > sheet)
                  problems.push('label under the sheet');
                if (!title || !actions || title > actions)
                  problems.push('title under the actions');
                return problems.join(', ');
              }),
            { message: id },
          )
          .toBe('');
      }
      await page.close();
    });
});

/** Everything in the open dialog that reaches past its left or right edge. */
async function dialogOverflow(page: Page) {
  return page.getByRole('dialog').evaluate((dialog) => {
    const box = dialog.getBoundingClientRect();
    const past: string[] = [];
    if (dialog.scrollWidth > dialog.clientWidth)
      past.push(
        `scrolls sideways by ${dialog.scrollWidth - dialog.clientWidth} px`,
      );
    for (const element of dialog.querySelectorAll('*')) {
      if (element.closest('[aria-hidden="true"]')) continue;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      if (rect.left < box.left - 0.5 || rect.right > box.right + 0.5)
        past.push(
          `${element.tagName.toLowerCase()} "${(element.textContent ?? '').trim().slice(0, 40)}"`,
        );
    }
    const label = dialog
      .querySelector('.dialog-eyebrow')
      ?.getBoundingClientRect();
    const close = dialog
      .querySelector('[data-slot="dialog-close"]')
      ?.getBoundingClientRect();
    if (
      label &&
      close &&
      label.right > close.left &&
      label.bottom > close.top &&
      label.top < close.bottom
    )
      past.push('the label runs under the close button');
    return past;
  });
}

/* The "Add a place" dialog ran past the right edge of a 390 px phone in Czech
 * (found on 12 November 2026). */
for (const [path, names] of [
  ['/', ['Add a place · soon', 'About the map Zahrady Prahy']],
  ['/cs/', ['Přidat místo · brzy', 'O mapě Zahrady Prahy']],
] as const) {
  for (const width of [320, 360, 390, 430]) {
    test(`both dialogs fit inside a ${width} px phone (${path})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await openAtlas(page, path);
      for (const name of names) {
        await page.getByRole('button', { name, exact: true }).first().click();
        await expect(page.getByRole('dialog')).toBeVisible();
        expect(await dialogOverflow(page), name).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
      }
    });
  }
}
