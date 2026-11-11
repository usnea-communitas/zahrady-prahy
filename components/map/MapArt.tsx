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
  MAP_ART_PHONE_MEDIA,
  MAP_ART_PHONE_SIZES,
  MAP_ART_PHONE_SRCSET,
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

const fill: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
};

/**
 * The illustrated map. On phones the original is laid over the lighter copy
 * only when the map is zoomed in beyond what the copy shows sharply; it fades
 * in once it has loaded, so the map never goes blank.
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
  const ready = useRef(onReady);
  useEffect(() => {
    ready.current = onReady;
  }, [onReady]);

  const finish = useCallback(() => {
    setLoaded(true);
    ready.current();
  }, []);
  // The picture may finish loading before hydration, when onLoad has already
  // fired; the ref callback sees the element's state as soon as it mounts.
  const artRef = useCallback(
    (node: HTMLImageElement | null) => {
      setArt(node);
      if (node?.complete && node.naturalWidth > 0) finish();
    },
    [finish],
  );

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
          onLoad={finish}
          onError={finish}
        />
      </picture>
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
