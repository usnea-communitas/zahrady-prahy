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

import {
  boundMapView,
  revealMapPoint,
  type MapView as View,
  type MapRect,
} from '@/lib/map/viewport';
const initialView: View = { zoom: 1, x: 0, y: 0 };
function mapFrame() {
  return (
    document.querySelector('.map-canvas')?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  );
}
function usableMapArea(frame = mapFrame()): MapRect {
  const bounds: MapRect = {
    left: 20,
    right: frame.width - 20,
    top: 88,
    bottom: frame.height - 104,
  };
  const header = document.querySelector('.map-header')?.getBoundingClientRect();
  const directory = document
    .querySelector('.garden-directory')
    ?.getBoundingClientRect();
  const detail = document
    .querySelector('.garden-preview')
    ?.getBoundingClientRect();
  if (header?.height) bounds.top = header.bottom - frame.top + 16;
  if (directory?.width) bounds.left = directory.right - frame.left + 20;
  if (detail?.width) bounds.right = detail.left - frame.left - 20;
  if (bounds.right - bounds.left < 160) bounds.left = 20;
  if (bounds.bottom - bounds.top < 180) bounds.bottom = frame.height - 60;
  return bounds;
}

export function MapViewport({
  children,
  focusTarget,
  revealRequest = 0,
  isFullscreen = false,
  onToggleFullscreen,
}: {
  children: ReactNode;
  focusTarget?: { id: string; x: number; y: number };
  revealRequest?: number;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}) {
  const [view, setView] = useState(initialView);
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
    const canvas = document.querySelector('.map-canvas');
    const observer = new ResizeObserver(resize);
    if (canvas) observer.observe(canvas);
    return () => observer.disconnect();
  }, [targetX, targetY]);
  function zoomBy(delta: number) {
    setView((current) => bounded({ ...current, zoom: current.zoom + delta }));
  }
  return (
    <>
      {/* A focusable two-dimensional map implements its own arrow/zoom keyboard contract. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div
        className="map-plane"
        role="application"
        aria-roledescription="interaktivní mapa"
        aria-label="Mapa: šipkami posun, plus a minus přiblížení, klávesou 0 celá mapa"
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
            setView(initialView);
          }
        }}
        onPointerDown={(event) => {
          if (
            event.button !== 0 ||
            (event.target as Element).closest('button') ||
            (view.zoom === 1 && !targetId)
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
      <fieldset className="map-navigation">
        <legend className="sr-only">Přiblížení mapy</legend>
        <button
          type="button"
          onClick={() => zoomBy(-0.2)}
          disabled={view.zoom <= 1}
          aria-label="Oddálit mapu"
        >
          <Minus />
        </button>
        <button
          type="button"
          onClick={() => onToggleFullscreen?.()}
          title={
            isFullscreen
              ? 'Vrátit mapu do rámu'
              : 'Zobrazit celou mapu přes celou obrazovku'
          }
          aria-label={
            isFullscreen
              ? 'Vrátit mapu do rámu'
              : 'Zobrazit celou mapu přes celou obrazovku'
          }
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
          <span>{isFullscreen ? 'Vrátit mapu' : 'Celá mapa'}</span>
        </button>
        <button
          type="button"
          onClick={() => zoomBy(0.2)}
          disabled={view.zoom >= 2.4}
          aria-label="Přiblížit mapu"
        >
          <Plus />
        </button>
        <button
          type="button"
          onClick={() => setView(initialView)}
          aria-label="Vrátit přiblížení a posun na výchozí přehled"
          title="Výchozí přehled (klávesa 0)"
        >
          <RotateCcw />
        </button>
      </fieldset>
    </>
  );
}
