# Browsers

The browser tests (`tests/e2e/`) run in Chromium in CI, and in WebKit (the
engine of Safari) and Firefox in the **Browsers** workflow beside it
(`BROWSER=webkit npm run test:e2e`, or `BROWSER=firefox`). Browsers is not a
required check; it is read before every merge. WebKit in Playwright is not
Safari on an iPhone: the phone's keyboard, the home screen and a screen
reader still need the real device (H4).

## Found and fixed

- **Safari on a computer downloaded the phone's map strips.** The two side
  strips are added after the first view has loaded. A `<picture>` added that
  late makes WebKit fetch its `<img>` before it reads the `<source>` that says
  "nothing here", so Safari on a computer or tablet loaded both strips for
  nothing. They are now added only on a phone held upright
  (`components/map/MapArt.tsx`).

## Known differences

- **WebKit without a graphics card** (the CI machines, containers) draws the
  map's drifting animations and the garden panel in software. It gets about
  two frames a second on the atlas and one on a garden page, against sixty on
  a blank page, so the WebKit run uses reduced motion (which the atlas
  honours) and seven tests that wait for motion to settle or for focus to come
  back are marked `fixme` there (`WEBKIT_WITHOUT_GPU` in
  `tests/e2e/atlas.ts`): panning to every garden, the close button over the
  garden text, a garden link opened in place, a garden opened and closed with
  the keyboard alone, a page for every garden, the map credit and the motion
  pause on a phone, and two-finger zoom. Real Safari draws them on the
  graphics card; check these on a real Mac or iPhone.
- **Firefox** has no mobile emulation in Playwright (its phone pages keep
  their size and touch, without `isMobile`), and Playwright cannot send it
  two-finger touches, so two-finger zoom is tested in Chromium only.
