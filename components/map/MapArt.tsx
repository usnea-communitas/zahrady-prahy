'use client';

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import { MapZoomContext } from '@/components/map/MapZoomContext';
import {
  MAP_ART_FULL,
  MAP_ART_FULL_AVIF,
  MAP_ART_NONE,
  MAP_ART_PHONE_MEDIA,
  MAP_ART_PHONE_SIZES,
  MAP_ART_PHONE_SRCSET,
  MAP_ART_PLACEHOLDER,
  MAP_ART_PORTRAIT_PHONE,
  MAP_ART_STRIPS,
  ONE_PIXEL_AVIF,
} from '@/lib/map/art';

/** How far a copy may be enlarged on screen before the original is needed. */
const ENLARGEMENT_LIMIT = 1.1;

/** Whether a phone copy is shown wider than its own pixels allow. */
function needsOriginal(art: HTMLImageElement) {
  // naturalWidth is scaled by the srcset density, so read the copy's real
  // width from its name; the original needs nothing laid over it.
  const copy = /-(\d+)\.webp$/.exec(
    new URL(art.currentSrc, window.location.href).pathname,
  );
  if (!copy) return false;
  // The bounding box includes the zoom (a transform on the map plane).
  const shown = art.getBoundingClientRect().width * window.devicePixelRatio;
  return shown > Number(copy[1]) * ENLARGEMENT_LIMIT;
}

/** Whether an image shows the map, not something that stands in for it. */
const showsPicture = (image: HTMLImageElement) =>
  image.naturalWidth > 0 &&
  !image.currentSrc.startsWith('data:') &&
  !image.currentSrc.endsWith(MAP_ART_PLACEHOLDER);

const fill: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
};

/**
 * The illustrated map. Wide screens show the original. A phone in portrait
 * shows three full-resolution strips over the blurred placeholder instead:
 * the middle one first, the other two once they come into view or the map is
 * touched (until then the placeholder shows there).
 * A small phone held sideways starts with a lighter copy and gets the
 * original laid over it once the map is zoomed in beyond what the copy shows
 * sharply (it fades in when loaded, so the map never goes blank).
 */
export function MapArt({
  alt,
  onReady,
}: {
  alt: string;
  /** Called once the first picture has loaded (or failed to). */
  onReady: () => void;
}) {
  const zoom = useContext(MapZoomContext);
  const [art, setArt] = useState<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [detail, setDetail] = useState<'none' | 'loading' | 'shown'>('none');
  const [sides, setSides] = useState(false);
  const ready = useRef(onReady);
  useEffect(() => {
    ready.current = onReady;
  }, [onReady]);

  const finish = useCallback(() => {
    setLoaded(true);
    ready.current();
  }, []);
  // Ready once the picture this screen shows has loaded: the whole map, or on
  // a phone in portrait its first strip. It may finish before hydration, when
  // onLoad has already fired; the ref callbacks see it as soon as they mount.
  const shown = useCallback(
    (image: HTMLImageElement) => {
      if (showsPicture(image)) finish();
    },
    [finish],
  );
  const artRef = useCallback(
    (node: HTMLImageElement | null) => {
      setArt(node);
      if (node?.complete) shown(node);
    },
    [shown],
  );
  const stripRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete) shown(node);
    },
    [shown],
  );

  // The strips beside the first view follow it, so they never compete with
  // it for the connection, and only where they are shown: a <picture> added
  // after the page loaded makes WebKit fetch its <img> before it reads the
  // <source> that says 'none here', so Safari on a computer would download
  // both side strips for nothing. On most phones the middle strip covers the
  // whole first view, so the side strips wait until a part of them comes
  // into view or the map is touched (chosen on 14 November 2026): a visitor
  // who only looks downloads about 200 kB less.
  const [portrait, setPortrait] = useState(false);
  const slotsRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const query = window.matchMedia(MAP_ART_PORTRAIT_PHONE);
    const update = () => setPortrait(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const strips = slotsRef.current;
    if (!loaded || sides || !portrait || !strips) return;
    const show = () => setSides(true);
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) show();
    });
    strips
      .querySelectorAll('.map-art-strip-slot')
      .forEach((slot) => observer.observe(slot));
    // a finger, a mouse, a wheel or a key on the map is about to move it
    const plane = strips.closest('.map-plane');
    const events = ['pointerdown', 'wheel', 'keydown'] as const;
    events.forEach((name) =>
      plane?.addEventListener(name, show, { once: true, passive: true }),
    );
    return () => {
      observer.disconnect();
      events.forEach((name) => plane?.removeEventListener(name, show));
    };
  }, [loaded, sides, portrait]);

  // Pictures added after the page has loaded name one file in the format the
  // browser can show (ONE_PIXEL_AVIF in lib/map/art.ts says why).
  const [avif, setAvif] = useState<boolean | null>(null);
  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setAvif(probe.width === 1);
    probe.onerror = () => setAvif(false);
    probe.src = ONE_PIXEL_AVIF;
  }, []);

  // After each zoom, measure in the next frame whether the copy is enlarged
  // too much to stay sharp.
  useEffect(() => {
    if (!art || !loaded || detail !== 'none') return;
    const frame = requestAnimationFrame(() => {
      if (needsOriginal(art)) setDetail('loading');
    });
    return () => cancelAnimationFrame(frame);
  }, [art, loaded, zoom, detail]);

  return (
    <>
      <picture>
        <source media={MAP_ART_PORTRAIT_PHONE} srcSet={MAP_ART_PLACEHOLDER} />
        <source
          media={MAP_ART_PHONE_MEDIA}
          srcSet={MAP_ART_PHONE_SRCSET}
          sizes={MAP_ART_PHONE_SIZES}
        />
        <source type="image/avif" srcSet={MAP_ART_FULL_AVIF} />
        <img
          ref={artRef}
          className="map-art"
          src={MAP_ART_FULL}
          alt={alt}
          style={fill}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={(event) => shown(event.currentTarget)}
          onError={finish}
        />
      </picture>
      <div className="map-art-strips" ref={slotsRef}>
        {/* where a side strip will go: watched until it comes into view */}
        {!sides &&
          MAP_ART_STRIPS.filter((strip) => !strip.first).map((strip) => (
            <div
              key={`${strip.name}-slot`}
              className="map-art-strip-slot"
              style={{ left: `${strip.left}%`, width: `${strip.width}%` }}
            />
          ))}
        {MAP_ART_STRIPS.filter(
          (strip) => strip.first || (sides && avif !== null),
        ).map((strip) => (
          <picture key={strip.name}>
            <source
              media={`not all and ${MAP_ART_PORTRAIT_PHONE}`}
              srcSet={MAP_ART_NONE}
            />
            {/* in the page from the server, the first strip lets the browser choose */}
            {strip.first && <source type="image/avif" srcSet={strip.avif} />}
            <img
              ref={strip.first ? stripRef : undefined}
              className="map-art-strip"
              src={strip.first || !avif ? strip.src : strip.avif}
              alt=""
              aria-hidden="true"
              style={{ left: `${strip.left}%`, width: `${strip.width}%` }}
              loading="eager"
              fetchPriority={strip.first ? 'high' : 'low'}
              decoding="async"
              onLoad={
                strip.first ? (event) => shown(event.currentTarget) : undefined
              }
              onError={strip.first ? finish : undefined}
            />
          </picture>
        ))}
      </div>
      {detail !== 'none' && avif !== null && (
        <img
          className={`map-art map-art-detail${detail === 'shown' ? ' is-shown' : ''}`}
          src={avif ? MAP_ART_FULL_AVIF : MAP_ART_FULL}
          alt=""
          aria-hidden="true"
          style={fill}
          decoding="async"
          onLoad={() => setDetail('shown')}
        />
      )}
    </>
  );
}
