import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  boundMapView,
  fitMapZoom,
  revealMapPoint,
  zoomMapAround,
} from '../lib/map/viewport.ts';
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
await test('on a phone the overview brings the map closer and keeps every garden in view', () => {
  const bounds = {
    left: Math.min(...gardens.map((garden) => garden.artPosition.x)),
    right: Math.max(...gardens.map((garden) => garden.artPosition.x)),
    top: Math.min(...gardens.map((garden) => garden.artPosition.y)),
    bottom: Math.max(...gardens.map((garden) => garden.artPosition.y)),
  };
  // map stages below the phone header, controls along the bottom edge
  for (const [width, height] of [
    [390, 740],
    [360, 636],
    [430, 818],
  ]) {
    const area = { left: 16, right: width - 16, top: 16, bottom: height - 80 };
    const zoom = fitMapZoom(width, height, bounds, area, 30);
    assert.ok(zoom > 1, `zoom ${zoom} at ${width}`);
    const artWidth = Math.min(width, (height * 1672) / 941);
    for (const garden of gardens) {
      const x =
        width / 2 + (garden.artPosition.x / 100 - 0.5) * artWidth * zoom;
      const y =
        height / 2 +
        (((garden.artPosition.y / 100 - 0.5) * artWidth) / (1672 / 941)) * zoom;
      assert.ok(
        x >= area.left + 29.999 && x <= area.right - 29.999,
        `${garden.id}: x=${x} at ${width}`,
      );
      assert.ok(
        y >= area.top + 29.999 && y <= area.bottom - 29.999,
        `${garden.id}: y=${y} at ${width}`,
      );
    }
  }
});
await test('zooming keeps the point between the fingers in place', () => {
  const view = { zoom: 1.5, x: 40, y: -20 };
  const anchor = { x: 100, y: 50 };
  const zoomed = zoomMapAround(view, 2.4, anchor);
  assert.equal(zoomed.zoom, 2.4);
  // the illustration point under the anchor, relative to the map centre
  const point = {
    x: (anchor.x - view.x) / view.zoom,
    y: (anchor.y - view.y) / view.zoom,
  };
  assert.ok(Math.abs(zoomed.x + point.x * zoomed.zoom - anchor.x) < 1e-9);
  assert.ok(Math.abs(zoomed.y + point.y * zoomed.zoom - anchor.y) < 1e-9);
  // zooming around the centre keeps an unpanned map centred
  assert.deepEqual(zoomMapAround({ zoom: 1, x: 0, y: 0 }, 2, { x: 0, y: 0 }), {
    zoom: 2,
    x: 0,
    y: 0,
  });
});
