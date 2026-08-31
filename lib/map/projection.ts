export const MAP_VIEWBOX = { width: 1672, height: 941 } as const;

export const MAP_BOUNDS = {
  west: 14.19,
  east: 14.688345737867333,
  south: 49.985,
  north: 50.165,
} as const;

export type GeoPoint = { lat: number; lon: number };

function mercatorY(latitude: number) {
  const radians = (latitude * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

export function projectToPercent(point: GeoPoint) {
  const north = mercatorY(MAP_BOUNDS.north);
  const south = mercatorY(MAP_BOUNDS.south);
  const latitude = mercatorY(point.lat);

  return {
    x:
      ((point.lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) *
      100,
    y: ((north - latitude) / (north - south)) * 100,
  };
}

export function projectToViewBox(point: GeoPoint) {
  const projected = projectToPercent(point);
  return {
    x: (projected.x / 100) * MAP_VIEWBOX.width,
    y: (projected.y / 100) * MAP_VIEWBOX.height,
  };
}
