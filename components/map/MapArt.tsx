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
  MAP_ART_NONE,
  MAP_ART_PHONE_MEDIA,
  MAP_ART_PHONE_SIZES,
  MAP_ART_PHONE_SRCSET,
  MAP_ART_PLACEHOLDER,
  MAP_ART_PORTRAIT_PHONE,
  MAP_ART_STRIPS,
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
 * the middle one first, the other two once it is on screen and the app runs.
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
  // both side strips for nothing.
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(MAP_ART_PORTRAIT_PHONE);
    const update = () => setPortrait(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!loaded || sides || !portrait) return;
    const frame = requestAnimationFrame(() => setSides(true));
    return () => cancelAnimationFrame(frame);
  }, [loaded, sides, portrait]);

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
      <div className="map-art-strips">
        {MAP_ART_STRIPS.filter((strip) => strip.first || sides).map((strip) => (
          <picture key={strip.name}>
            <source
              media={`not all and ${MAP_ART_PORTRAIT_PHONE}`}
              srcSet={MAP_ART_NONE}
            />
            <img
              ref={strip.first ? stripRef : undefined}
              className="map-art-strip"
              src={strip.src}
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
      {detail !== 'none' && (
        <img
          className={`map-art map-art-detail${detail === 'shown' ? ' is-shown' : ''}`}
          src={MAP_ART_FULL}
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
