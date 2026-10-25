'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The map is a keyboard-operated two-dimensional widget with a separate accessible list. */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Maximize2, Minimize2, Minus, Plus, RotateCcw } from 'lucide-react';

import { useT } from '@/components/i18n/LocaleProvider';
import {
  boundMapView,
  coverZoom,
  maxMapZoom,
  revealMapPoint,
  type MapView as View,
  type MapRect,
} from '@/lib/map/viewport';
const initialView: View = { zoom: 1, x: 0, y: 0 };
/** Default overview: whole map on wide screens, map filling the screen on portrait phones. */
function homeView(): View {
  const frame = mapFrame();
  return {
    // portrait phones: closer than the thin full-width strip, but not so close
    // that most gardens start off-screen (drag pans, the list lists all)
    zoom:
      frame.height > frame.width
        ? Math.min(coverZoom(frame.width, frame.height), 1.6)
        : 1,
    x: 0,
    y: 0,
  };
}
/**
 * The stage is the part of the frame below the header band; the illustration
 * is centred in it and every camera calculation uses its rectangle.
 */
function mapFrame() {
  return (
    document.querySelector('.map-stage')?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  );
}
/** The part of the stage that no control or panel covers, in stage pixels. */
function usableMapArea(frame = mapFrame()): MapRect {
  const bounds: MapRect = {
    left: 16,
    right: frame.width - 16,
    top: 16,
    bottom: frame.height - 16,
  };
  const onStage = (selector: string) => {
    const rect = document.querySelector(selector)?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return null;
    return {
      left: rect.left - frame.left,
      right: rect.right - frame.left,
      top: rect.top - frame.top,
      bottom: rect.bottom - frame.top,
      width: rect.width,
    };
  };
  const header = onStage('.map-header');
  if (header && header.bottom > 0) bounds.top = header.bottom + 16;
  // zoom controls: a side column on wide screens, a bottom bar on phones
  const controls = onStage('.map-navigation');
  if (controls) {
    if (controls.width > controls.bottom - controls.top)
      bounds.bottom = Math.min(bounds.bottom, controls.top - 12);
    else if (controls.left < frame.width / 2)
      bounds.left = Math.max(bounds.left, controls.right + 12);
    else bounds.right = Math.min(bounds.right, controls.left - 12);
  }
  const footer = onStage('.map-footer');
  if (footer) bounds.bottom = Math.min(bounds.bottom, footer.top - 8);
  // side panels on wide screens, bottom sheets (full width) on phones
  const isSheet = (rect: { width: number }) => rect.width > frame.width - 40;
  const directory = onStage('.garden-directory');
  if (directory) {
    if (isSheet(directory))
      bounds.bottom = Math.min(bounds.bottom, directory.top - 16);
    else bounds.left = Math.max(bounds.left, directory.right + 20);
  }
  const detail = onStage('.garden-preview');
  if (detail) {
    if (isSheet(detail))
      bounds.bottom = Math.min(bounds.bottom, detail.top - 16);
    else bounds.right = Math.min(bounds.right, detail.left - 20);
  }
  if (bounds.right - bounds.left < 160) bounds.left = 20;
  if (bounds.bottom - bounds.top < 90) bounds.bottom = frame.height - 60;
  return bounds;
}

export function MapViewport({
  children,
  controls,
  focusTarget,
  revealRequest = 0,
  isFullscreen = false,
  onToggleFullscreen,
}: {
  children: ReactNode;
  /** Extra buttons appended to the map controls (for example motion). */
  controls?: ReactNode;
  focusTarget?: { id: string; x: number; y: number };
  revealRequest?: number;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}) {
  const t = useT();
  const [view, setView] = useState(initialView);
  const [maxZoom, setMaxZoom] = useState(2.4);
  const placed = useRef(false);
  const drag = useRef<{ id: number; x: number; y: number; view: View } | null>(
    null,
  );
  const targetId = focusTarget?.id;
  const targetX = focusTarget?.x;
  const targetY = focusTarget?.y;
  function bounded(view: View): View {
    const frame = mapFrame();
    return boundMapView(
      view,
      frame.width,
      frame.height,
      targetId ? usableMapArea(frame) : undefined,
    );
  }
  useEffect(() => {
    if (!targetId || targetX === undefined || targetY === undefined) return;
    const frame = requestAnimationFrame(() => {
      drag.current = null;
      const bounds = mapFrame();
      setView((current) =>
        revealMapPoint(
          current,
          { x: targetX, y: targetY },
          bounds.width,
          bounds.height,
          usableMapArea(bounds),
        ),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [targetId, targetX, targetY, revealRequest]);
  useEffect(() => {
    const resize = () => {
      const frame = mapFrame();
      setMaxZoom(maxMapZoom(frame.width, frame.height));
      if (!placed.current) {
        placed.current = true;
        if (targetX === undefined || targetY === undefined) {
          setView(homeView());
          return;
        }
      }
      setView((current) =>
        targetX !== undefined && targetY !== undefined
          ? revealMapPoint(
              current,
              { x: targetX, y: targetY },
              frame.width,
              frame.height,
              usableMapArea(frame),
            )
          : boundMapView(current, frame.width, frame.height),
      );
    };
    const stage = document.querySelector('.map-stage');
    const observer = new ResizeObserver(resize);
    if (stage) observer.observe(stage);
    return () => observer.disconnect();
  }, [targetX, targetY]);
  function zoomBy(delta: number) {
    setView((current) => bounded({ ...current, zoom: current.zoom + delta }));
  }
  return (
    <>
      <div className="map-stage">
        {/* A focusable two-dimensional map implements its own arrow/zoom keyboard contract. */}
        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <div
          className="map-plane"
          role="application"
          aria-roledescription={t.map.planeRole}
          aria-label={t.map.planeLabel}
          tabIndex={0}
          style={
            {
              transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px)) scale(${view.zoom})`,
              '--scene-zoom': view.zoom,
              cursor: view.zoom > 1 || targetId ? 'grab' : 'default',
            } as CSSProperties
          }
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const shifts: Record<string, [number, number]> = {
              ArrowLeft: [48, 0],
              ArrowRight: [-48, 0],
              ArrowUp: [0, 48],
              ArrowDown: [0, -48],
            };
            if (shifts[event.key]) {
              event.preventDefault();
              const [x, y] = shifts[event.key];
              setView((current) =>
                bounded({ ...current, x: current.x + x, y: current.y + y }),
              );
            } else if (['+', '=', '-'].includes(event.key)) {
              event.preventDefault();
              zoomBy(event.key === '-' ? -0.2 : 0.2);
            } else if (event.key === '0') {
              event.preventDefault();
              setView(homeView());
            }
          }}
          onPointerDown={(event) => {
            if (
              event.button !== 0 ||
              (event.target as Element).closest('button') ||
              (view.zoom <= 1 && !targetId)
            )
              return;
            event.preventDefault();
            drag.current = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              view,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (!start || event.pointerId !== start.id) return;
            setView(
              bounded({
                ...start.view,
                x: start.view.x + event.clientX - start.x,
                y: start.view.y + event.clientY - start.y,
              }),
            );
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
        >
          {children}
        </div>
      </div>
      <fieldset className="map-navigation">
        <legend className="sr-only">{t.map.zoomLegend}</legend>
        <button
          type="button"
          onClick={() => zoomBy(0.2)}
          disabled={view.zoom >= maxZoom - 0.001}
          aria-label={t.map.zoomIn}
          title={t.map.zoomIn}
        >
          <Plus />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-0.2)}
          disabled={view.zoom <= 1}
          aria-label={t.map.zoomOut}
          title={t.map.zoomOut}
        >
          <Minus />
        </button>
        <button
          type="button"
          onClick={() => onToggleFullscreen?.()}
          title={isFullscreen ? t.map.fullscreenExit : t.map.fullscreenEnter}
          aria-label={
            isFullscreen ? t.map.fullscreenExit : t.map.fullscreenEnter
          }
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
        </button>
        <button
          type="button"
          onClick={() => setView(homeView())}
          aria-label={t.map.resetView}
          title={t.map.resetViewTitle}
        >
          <RotateCcw />
        </button>
        {controls}
      </fieldset>
    </>
  );
}
