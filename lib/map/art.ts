/**
 * The illustrated map and its lighter copies for phones
 * (scripts/build-map-variants.mjs). Used by the picture (components/map/MapArt.tsx)
 * and by the preload hints in the head of every page (src/entry-server.tsx),
 * which must name exactly the same files.
 */
const ART = '/map/prague-storybook-vltava-v6';

/** The original, 1672 × 941: what wide screens always get. */
export const MAP_ART_FULL = `${ART}-wide.webp`;
/**
 * A phone in portrait shows the map about as wide as its screen (the home
 * view zooms it a little further), so it starts with the copy that matches
 * its pixel density: 960 or 1280 px wide, at most 218 kB instead of 621 kB.
 */
export const MAP_ART_PHONE_MEDIA = '(max-width: 720px)';
export const MAP_ART_PHONE_SRCSET = `${ART}-960.webp 960w, ${ART}-1280.webp 1280w`;
export const MAP_ART_PHONE_SIZES = 'calc(100vw * 1.08)';
