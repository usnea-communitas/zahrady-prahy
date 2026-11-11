// The page arrives already drawn (scripts/build-static.mjs), so it is shown
// first and the app follows: on a slow phone the map then gets the connection
// to itself, and nobody waits for the script before seeing anything.
import '../app/globals.css';
import '../app/atlas.css';
import '../app/gallery.css';
import '../app/mobile.css';
import './fonts.css';

let started = false;
const start = () => {
  if (started) return;
  started = true;
  void import('./hydrate');
  // Garden names are set in the serif; phones do not preload it.
  void document.fonts?.load('1em "Playfair Display"').catch(() => {});
};

// A hidden tab shows nothing, and the development server sends an empty
// page, so both start at once. Otherwise the app loads once the browser
// reports the first painted content, or after a second where it does not
// report paints.
if (
  document.visibilityState !== 'visible' ||
  !document.getElementById('root')?.hasChildNodes()
)
  start();
else {
  setTimeout(start, 1000);
  try {
    const paints = new PerformanceObserver((list) => {
      if (!list.getEntriesByName('first-contentful-paint').length) return;
      paints.disconnect();
      start();
    });
    paints.observe({ type: 'paint', buffered: true });
  } catch {
    requestAnimationFrame(() => setTimeout(start, 0));
  }
}
