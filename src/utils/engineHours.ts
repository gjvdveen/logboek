import type { Trip, FuelEntry, RepairEntry } from '../types';

type Exclude =
  | { type: 'trip';   id: string }
  | { type: 'fuel';   id: string }
  | { type: 'repair'; id: string };

/**
 * Returns the highest known engine-hours value across all entries.
 * Pass `exclude` when editing an existing entry so its own value is not used
 * as the minimum.
 */
export function getLastEngineHours(
  trips:         Trip[],
  fuelEntries:   FuelEntry[],
  repairEntries: RepairEntry[],
  exclude?:      Exclude,
): number | null {
  const values: number[] = [];

  for (const t of trips) {
    if (exclude?.type === 'trip' && exclude.id === t.id) continue;
    const dep = parseFloat(t.engineHoursDeparture);
    const arr = parseFloat(t.engineHoursArrival);
    if (!isNaN(dep)) values.push(dep);
    if (!isNaN(arr)) values.push(arr);
  }

  for (const e of fuelEntries) {
    if (exclude?.type === 'fuel' && exclude.id === e.id) continue;
    const h = parseFloat(e.engineHours);
    if (!isNaN(h)) values.push(h);
  }

  for (const r of repairEntries) {
    if (exclude?.type === 'repair' && exclude.id === r.id) continue;
    const h = parseFloat(r.engineHours);
    if (!isNaN(h)) values.push(h);
  }

  return values.length > 0 ? Math.max(...values) : null;
}
