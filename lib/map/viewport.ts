export type MapView = { zoom: number; x: number; y: number };
export type MapRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

const MAP_ASPECT = 1672 / 941;

/** Zoom at which the illustration fills the whole frame (1 on landscape screens). */
export function coverZoom(viewportWidth: number, viewportHeight: number) {
  const width = Math.min(viewportWidth, viewportHeight * MAP_ASPECT);
  if (!(width > 0)) return 1;
  return Math.max(
    1,
    viewportWidth / width,
    (viewportHeight * MAP_ASPECT) / width,
  );
}

/**
 * Highest zoom at which every point of `bounds` (percent of the illustration)
 * stays inside `area` (pixels of the viewport) with the map centred, keeping
 * `margin` pixels clear so whole markers fit, not just their centres.
 */
export function fitMapZoom(
  viewportWidth: number,
  viewportHeight: number,
  bounds: MapRect,
  area: MapRect,
  margin = 0,
) {
  const artWidth = Math.min(viewportWidth, viewportHeight * MAP_ASPECT);
  const artHeight = artWidth / MAP_ASPECT;
  const centreX = viewportWidth / 2;
  const centreY = viewportHeight / 2;
  const limits: number[] = [];
  const fit = (room: number, extent: number) => {
    if (extent > 0) limits.push(room / extent);
  };
  fit(area.right - margin - centreX, (bounds.right / 100 - 0.5) * artWidth);
  fit(centreX - area.left - margin, (0.5 - bounds.left / 100) * artWidth);
  fit(area.bottom - margin - centreY, (bounds.bottom / 100 - 0.5) * artHeight);
  fit(centreY - area.top - margin, (0.5 - bounds.top / 100) * artHeight);
  return limits.length ? Math.min(...limits) : Infinity;
}

/**
 * Changes the zoom while the point under `anchor` (pixels from the viewport
 * centre, e.g. between two fingers) stays where it is.
 */
export function zoomMapAround(
  view: MapView,
  zoom: number,
  anchor: { x: number; y: number },
): MapView {
  const factor = zoom / view.zoom;
  return {
    zoom,
    x: anchor.x - (anchor.x - view.x) * factor,
    y: anchor.y - (anchor.y - view.y) * factor,
  };
}

/** Highest zoom: 2.4× on wide screens, more on phones where the map starts covered. */
export function maxMapZoom(viewportWidth: number, viewportHeight: number) {
  return Math.max(2.4, coverZoom(viewportWidth, viewportHeight) * 1.6);
}

export function boundMapView(
  view: MapView,
  viewportWidth: number,
  viewportHeight: number,
  usable?: MapRect,
): MapView {
  const zoom = Math.max(
    1,
    Math.min(maxMapZoom(viewportWidth, viewportHeight), view.zoom),
  );
  const width = Math.min(viewportWidth, viewportHeight * (1672 / 941));
  const maxX = Math.max(0, (width * zoom - viewportWidth) / 2);
  const maxY = Math.max(
    0,
    ((width / (1672 / 941)) * zoom - viewportHeight) / 2,
  );
  if (usable) {
    // Allow a narrow illustrated margin to move behind the panels. The blurred
    // backdrop fills exposed edges; selected labels must never be trapped there.
    const halfWidth = (width * zoom) / 2;
    const halfHeight = ((width / (1672 / 941)) * zoom) / 2;
    const minX = usable.right - viewportWidth / 2 - halfWidth - 128;
    const maxUsableX = usable.left - viewportWidth / 2 + halfWidth + 128;
    const minY = usable.bottom - viewportHeight / 2 - halfHeight - 128;
    const maxUsableY = usable.top - viewportHeight / 2 + halfHeight + 128;
    return {
      zoom,
      x: Math.max(minX, Math.min(maxUsableX, view.x)),
      y: Math.max(minY, Math.min(maxUsableY, view.y)),
    };
  }
  return {
    zoom,
    x: Math.max(-maxX, Math.min(maxX, view.x)),
    y: Math.max(-maxY, Math.min(maxY, view.y)),
  };
}

export function revealMapPoint(
  view: MapView,
  point: { x: number; y: number },
  viewportWidth: number,
  viewportHeight: number,
  usable: MapRect,
): MapView {
  const width = Math.min(viewportWidth, viewportHeight * (1672 / 941));
  const px =
    viewportWidth / 2 + view.x + (point.x / 100 - 0.5) * width * view.zoom;
  const py =
    viewportHeight / 2 +
    view.y +
    (((point.y / 100 - 0.5) * width) / (1672 / 941)) * view.zoom;
  const horizontalSpace = Math.min(120, (usable.right - usable.left) / 2);
  const bottomSpace = Math.min(144, (usable.bottom - usable.top) / 2);
  const targetX = Math.max(
    usable.left + horizontalSpace,
    Math.min(usable.right - horizontalSpace, px),
  );
  const targetY = Math.max(
    usable.top + 40,
    Math.min(usable.bottom - bottomSpace, py),
  );
  return boundMapView(
    { ...view, x: view.x + targetX - px, y: view.y + targetY - py },
    viewportWidth,
    viewportHeight,
    usable,
  );
}
