/**
 * The illustrated map and its phone versions (scripts/build-map-variants.mjs).
 * Used by the picture (components/map/MapArt.tsx), the camera
 * (components/map/MapViewport.tsx) and the preload hints in the head of every
 * page (src/entry-server.tsx), which must name exactly the same files.
 */
const ART = '/map/prague-storybook-vltava-v6';

/** The original, 1672 × 941: what wide screens always get. */
export const MAP_ART_FULL = `${ART}-wide.webp`;
export const MAP_ART_WIDTH = 1672;

/**
 * The original and the strips also come in AVIF, two fifths and a fifth
 * smaller with nothing lost to the eye (Z-13). A <picture> offers the AVIF
 * first; a browser that cannot show it takes the WebP.
 */
export const MAP_ART_FULL_AVIF = `${ART}-wide.avif`;

/**
 * A phone in portrait shows the map as high as the screen allows (chosen on
 * 11 November 2026), two to three times wider than the screen, and pans it
 * sideways. That needs the full resolution, so the map comes in three strips:
 * the middle one covers the first view and loads first, the other two once
 * the app runs (nobody can pan to them before).
 */
export const MAP_ART_PORTRAIT_PHONE =
  '(max-width: 720px) and (orientation: portrait)';
export const MAP_ART_STRIPS = [
  { name: 'left', from: 0, to: 504, first: false },
  { name: 'centre', from: 500, to: 1172, first: true },
  { name: 'right', from: 1168, to: 1672, first: false },
].map((strip) => ({
  ...strip,
  src: `${ART}-strip-${strip.name}.webp`,
  avif: `${ART}-strip-${strip.name}.avif`,
  left: (strip.from / MAP_ART_WIDTH) * 100,
  width: ((strip.to - strip.from) / MAP_ART_WIDTH) * 100,
}));
export const MAP_ART_FIRST_STRIP = MAP_ART_STRIPS.find((strip) => strip.first)!;

/**
 * A small phone held sideways shows the whole map as high as the stage below
 * the 114 px header band (app/mobile.css) and gets the copy that matches its
 * pixel density: 960 or 1280 px wide, at most 218 kB instead of 621 kB.
 */
export const MAP_ART_PHONE_MEDIA = '(max-width: 720px)';
export const MAP_ART_PHONE_SRCSET = `${ART}-960.webp 960w, ${ART}-1280.webp 1280w`;
export const MAP_ART_PHONE_SIZES = 'calc((100vh - 114px) * 1.78)';

/**
 * The 1.5 kB placeholder, 96 px wide. A phone in portrait shows it under the
 * strips, so a part of the map whose strip is still loading looks blurred
 * rather than blank.
 */
export const MAP_ART_PLACEHOLDER = `${ART}-placeholder.webp`;

/**
 * A one-pixel AVIF. What the page adds after it has loaded (the side strips,
 * the original laid over a zoomed copy) names one file, chosen by whether the
 * browser can show this: WebKit fetches the <img> of a <picture> added later
 * before it reads its <source>s, and would download both formats.
 */
export const ONE_PIXEL_AVIF =
  'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAACJpbG9jAAAAAERAAAEAAQAAAAAA+gABAAAAAAAAAB0AAAAjaWluZgAAAAAAAQAAABVpbmZlAgAAAAABAABhdjAxAAAAAA5waXRtAAAAAAABAAAAVmlwcnAAAAA4aXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAEAAQOBAgMAAAAlbWRhdBIACgc4AAaQENBpMhAZQmMEwAA0AACQQMkcYIpq';

/** A transparent pixel: what a picture shows where another one stands in. */
export const MAP_ART_NONE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
