import type { Trip } from '../types';

/**
 * Returns all unique ports visited across all trips,
 * ordered by most recently visited (descending).
 */
export function getRecentPorts(trips: Trip[]): string[] {
  // map: normalised name → { display, latestDate }
  const map = new Map<string, { display: string; date: string }>();

  for (const trip of trips) {
    const entries: [string, string][] = [];
    if (trip.from) entries.push([trip.from.trim(), trip.departureDate]);
    if (trip.to)   entries.push([trip.to.trim(),   trip.arrivalDate || trip.departureDate]);

    for (const [port, date] of entries) {
      if (!port) continue;
      const key      = port.toLowerCase();
      const existing = map.get(key);
      if (!existing || date > existing.date) {
        map.set(key, { display: port, date });
      }
    }
  }

  return [...map.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(v => v.display);
}
