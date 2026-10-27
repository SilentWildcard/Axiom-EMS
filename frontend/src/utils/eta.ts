// ETA calculation utilities (mirrors backend formula for client-side use)

export function calculateETA(remainingDistanceM: number, speedKmh: number): number {
  // Formula: eta_s = remaining_distance_m / (speed_kmh / 3.6)
  const speedMs = speedKmh / 3.6;
  if (speedMs <= 0) return Infinity;
  return remainingDistanceM / speedMs;
}

export function formatETA(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}
