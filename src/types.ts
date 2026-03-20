/* ── Crew member ── */
export interface CrewMember {
  id: string;
  name: string;
  type: 'vast' | 'tijdelijk';
  createdAt: string;
}

export type CrewFormData = Omit<CrewMember, 'id' | 'createdAt'>;

/* ── Trip ── */
export interface Trip {
  id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  distance: string;            // zeemijlen
  avgSpeed: string;            // knopen
  engineHoursDeparture: string;
  engineHoursArrival: string;
  harborFee: string;           // € havengeld
  windForce: string;           // Beaufort 0-12
  windDirection: string;
  visibility: string;
  weather: string;
  waterLevel: string;          // drinkwater stand (%)
  waterRefilled: boolean;      // bijgevuld?
  batteryPercent: string;      // accu stand (%)
  solarKwh: string;            // opgewekt met zonnepanelen (kWh)
  notes: string;
  crewIds: string[];
  invoiceIds: string[];
  photoIds: string[];
  reisId: string;              // '' = losse tocht
  isDayLog: boolean;           // true = dag aan boord zonder vaartocht
  tempCrew: string[];          // tijdelijke bemanning (vrije namen)
  createdAt: string;
}

export type TripFormData = Omit<Trip, 'id' | 'createdAt'>;

/* ── Reis (groep van meerdere tochten) ── */
export interface Reis {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  notes: string;
  crewIds: string[];
  createdAt: string;
}

export type ReisFormData = Omit<Reis, 'id' | 'createdAt'>;

/* ── Boot gegevens ── */
export interface BootData {
  naam: string;
  type: string;
  ligplaats: string;
  boxnr: string;
  lengte: string;       // meters
  breedte: string;      // meters
  diepgang: string;     // meters
  tankWater: string;    // liter
  tankBrandstof: string; // liter
  maxAccu: string;      // Ah
  bannerImageId: string; // IndexedDB file id voor de bannerfoto
}

/* ── Seizoensstart ── */
export interface SeizoenStart {
  id: string;
  date: string;
  location: string;
  engineHours: string;
  batteryPercent: string;
  waterLevel: string;
  notes: string;
  createdAt: string;
}

export type SeizoenStartFormData = Omit<SeizoenStart, 'id' | 'createdAt'>;

/* ── Day log (niet-vaardag) ── */
export interface DayLog {
  id: string;
  date: string;
  location: string;
  waterLevel: string;
  waterRefilled: boolean;
  batteryPercent: string;
  solarKwh: string;
  notes: string;
  createdAt: string;
}

export type DayLogFormData = Omit<DayLog, 'id' | 'createdAt'>;

/* ── Fuel entry ── */
export interface FuelEntry {
  id: string;
  date: string;
  location: string;
  engineHours: string;
  liters: string;
  pricePerLiter: string;
  notes: string;
  invoiceIds: string[];
  createdAt: string;
}

export type FuelFormData = Omit<FuelEntry, 'id' | 'createdAt'>;

/* ── Repair entry ── */
export interface RepairEntry {
  id: string;
  date: string;
  description: string;
  cost: string;
  costType: 'eenmalig' | 'jaarlijks';
  supplier: string;
  engineHours: string;
  notes: string;
  invoiceIds: string[];
  createdAt: string;
}

export type RepairFormData = Omit<RepairEntry, 'id' | 'createdAt'>;

/* ── Maintenance task ── */
export interface MaintenanceTask {
  id: string;
  description: string;
  intervalHours: string;    // '' = not hour-based
  intervalDays: string;     // '' = not day-based
  lastDoneHours: string;    // engine hours when last performed
  lastDoneDate: string;     // ISO date when last performed
  notes: string;
  createdAt: string;
}

export type MaintenanceFormData = Omit<MaintenanceTask, 'id' | 'createdAt'>;

/* ── Lookup tables ── */
export const WIND_DIRECTIONS = [
  'N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO',
  'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW',
] as const;

export const WEATHER_OPTIONS = [
  { value: 'zonnig',      label: 'Zonnig' },
  { value: 'halfbewolkt', label: 'Half bewolkt' },
  { value: 'bewolkt',     label: 'Bewolkt' },
  { value: 'regen',       label: 'Regen' },
  { value: 'mist',        label: 'Mist' },
  { value: 'onweer',      label: 'Onweer' },
] as const;

export const VISIBILITY_OPTIONS = [
  { value: 'goed',   label: 'Goed (>5 nm)' },
  { value: 'matig',  label: 'Matig (1–5 nm)' },
  { value: 'slecht', label: 'Slecht (<1 nm)' },
] as const;
