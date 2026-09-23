import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boundMapView, revealMapPoint } from '../lib/map/viewport.ts';
import { gardens } from '../lib/gardens.ts';

await test('fit view is centered at common desktop sizes', () => {
  for (const [width, height] of [
    [1920, 1080],
    [1280, 900],
    [820, 912],
  ]) {
    const view = boundMapView({ zoom: 1, x: 10000, y: -10000 }, width, height);
    assert.equal(Math.abs(view.x), 0);
    assert.equal(Math.abs(view.y), 0);
  }
});

await test('every garden can be revealed beside desktop panels, at fit and maximum zoom', () => {
  /** @type {Array<[number, number, import('../lib/map/viewport.ts').MapRect]>} */
  const scenarios = [
    [1920, 1080, { left: 394, right: 1440, top: 110, bottom: 940 }],
    [1280, 900, { left: 394, right: 800, top: 110, bottom: 760 }],
    [820, 912, { left: 20, right: 356, top: 100, bottom: 772 }],
  ];
  for (const [width, height, safe] of scenarios) {
    for (const zoom of [1, 2.4])
      for (const garden of gardens) {
        const start = { zoom, x: 500, y: -300 };
        const view = revealMapPoint(
          start,
          garden.artPosition,
          width,
          height,
          safe,
        );
        const artWidth = Math.min(width, (height * 1672) / 941);
        const x =
          width / 2 +
          view.x +
          (garden.artPosition.x / 100 - 0.5) * artWidth * view.zoom;
        const y =
          height / 2 +
          view.y +
          (((garden.artPosition.y / 100 - 0.5) * artWidth) / (1672 / 941)) *
            view.zoom;
        assert.equal(view.zoom, zoom);
        assert.ok(
          x >= safe.left + 110 && x <= safe.right - 110,
          `${garden.id}: x=${x} at ${width}, zoom ${zoom}`,
        );
        assert.ok(
          y >= safe.top + 39 && y <= safe.bottom - 135,
          `${garden.id}: y=${y} at ${width}, zoom ${zoom}`,
        );
      }
  }
});
await test('reveal is stable when the marker already fits', () => {
  const view = { zoom: 1.8, x: 0, y: 0 };
  assert.deepEqual(
    revealMapPoint(view, { x: 50, y: 40 }, 1920, 1080, {
      left: 400,
      right: 1450,
      top: 100,
      bottom: 900,
    }),
    view,
  );
});
await test('zoom and drag are bounded and reset removes the offset', () => {
  const view = boundMapView({ zoom: 20, x: 10000, y: -10000 }, 1672, 941);
  assert.equal(view.zoom, 2.4);
  assert.ok(view.x <= 1672 * 0.7 + 0.001);
  assert.ok(view.y >= -941 * 0.7 - 0.001);
  assert.equal(boundMapView({ zoom: -1, x: 50, y: 50 }, 1672, 941).zoom, 1);
});
