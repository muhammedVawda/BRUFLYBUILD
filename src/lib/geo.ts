/** Simplified outline of South Africa as [lat, lng] pairs (clockwise from the Namibian border). */
export const saOutline: [number, number][] = [
  [-28.6, 16.5], [-28.2, 17.4], [-28.4, 18.6], [-28.9, 19.9], [-28.5, 20.4], [-26.9, 20.6], [-25.7, 22.6],
  [-25.5, 23.9], [-25.7, 25.1], [-24.7, 25.9], [-23.9, 26.8], [-22.9, 27.9], [-22.2, 29.0], [-22.3, 30.2],
  [-22.4, 31.3], [-23.6, 31.5], [-24.4, 31.9], [-25.6, 32.0], [-26.2, 32.1], [-27.0, 32.9], [-27.9, 32.5],
  [-28.9, 31.9], [-29.9, 31.0], [-31.0, 30.2], [-32.0, 29.0], [-32.9, 28.0], [-33.6, 26.9], [-34.0, 25.6],
  [-34.2, 24.5], [-34.1, 23.3], [-34.3, 22.2], [-34.4, 21.0], [-34.7, 20.0], [-34.8, 19.6], [-34.4, 18.9],
  [-34.2, 18.4], [-33.8, 18.3], [-33.1, 17.9], [-32.3, 18.2], [-31.5, 18.0], [-30.6, 17.4], [-29.8, 17.0],
  [-29.2, 16.8],
];

export const bounds = { minLat: -35.2, maxLat: -22.0, minLng: 16.2, maxLng: 33.2 };

/** Equirectangular projection into a W×H box with padding. */
export function project(lat: number, lng: number, W: number, H: number, pad = 12): { x: number; y: number } {
  const x = pad + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (W - pad * 2);
  const y = pad + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (H - pad * 2);
  return { x, y };
}
