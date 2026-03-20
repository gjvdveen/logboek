/**
 * Demo data – fictieve vaargegevens in de regio Zeeland.
 * Echte data wordt eerst opgeslagen in backup-sleutels zodat je kunt terugkeren.
 */

const BOOT_KEY     = 'boot-logboek-bootdata-v1';
const TRIPS_KEY    = 'boot-logboek-v1';
const FUEL_KEY     = 'boot-logboek-fuel-v1';
const REPAIRS_KEY  = 'boot-logboek-repairs-v1';
const CREW_KEY     = 'boot-logboek-crew-v1';
const DAYLOG_KEY   = 'boot-logboek-daylog-v1';
const REIZEN_KEY   = 'boot-logboek-reizen-v1';
const SEIZOEN_KEY  = 'boot-logboek-seizoen-v1';

const MAINT_KEY    = 'boot-logboek-maintenance-v1';

const DATA_KEYS = [BOOT_KEY, TRIPS_KEY, FUEL_KEY, REPAIRS_KEY, CREW_KEY, DAYLOG_KEY, REIZEN_KEY, SEIZOEN_KEY, MAINT_KEY];

const DEMO_ACTIVE_KEY = 'boot-logboek-demo-active';
const BAK_PREFIX      = '_bak_';

export function isDemoActive(): boolean {
  return localStorage.getItem(DEMO_ACTIVE_KEY) === '1';
}

function backupRealData() {
  DATA_KEYS.forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) localStorage.setItem(BAK_PREFIX + k, v);
    else localStorage.removeItem(BAK_PREFIX + k);
  });
}

function restoreBackup() {
  DATA_KEYS.forEach(k => {
    const v = localStorage.getItem(BAK_PREFIX + k);
    if (v !== null) localStorage.setItem(k, v);
    else localStorage.removeItem(k);
    localStorage.removeItem(BAK_PREFIX + k);
  });
}

export function loadDemoData() {
  backupRealData();

  // ── Boot ────────────────────────────────────────────────────────────────
  const boot = {
    naam: 'De Zeeleeuw',
    type: 'Motorjacht',
    ligplaats: 'Jachthaven Middelburg',
    boxnr: 'B-47',
    lengte: '12.50',
    breedte: '3.80',
    diepgang: '1.10',
    tankWater: '300',
    tankBrandstof: '500',
    maxAccu: '400',
    bannerImageId: '',
  };

  // ── Bemanning ────────────────────────────────────────────────────────────
  const crew = [
    { id: 'crew-d1', name: 'Jan de Vries',   type: 'vast', createdAt: '2024-01-10T09:00:00Z' },
    { id: 'crew-d2', name: 'Marie de Vries', type: 'vast', createdAt: '2024-01-10T09:01:00Z' },
    { id: 'crew-d3', name: 'Peter Smit',     type: 'vast', createdAt: '2024-01-10T09:02:00Z' },
  ];

  // ── Reizen ───────────────────────────────────────────────────────────────
  const reizen = [
    {
      id: 'reis-d3',
      name: 'Delta Voorjaarstocht',
      startDate: '2024-05-17',
      endDate: '2024-05-19',
      notes: 'Eerste grote tocht van het seizoen via het Veerse Meer naar Zierikzee en Bruinisse.',
      crewIds: ['crew-d1', 'crew-d2', 'crew-d3'],
      createdAt: '2024-05-10T10:00:00Z',
    },
    {
      id: 'reis-d1',
      name: 'Westerschelde Zomertocht',
      startDate: '2024-07-12',
      endDate: '2024-07-16',
      notes: 'Uitgebreide tocht langs de Westerschelde: Vlissingen, Breskens, Terneuzen en Hansweert.',
      crewIds: ['crew-d1', 'crew-d2', 'crew-d3'],
      createdAt: '2024-07-01T10:00:00Z',
    },
    {
      id: 'reis-d2',
      name: 'Veerse Meer Weekend',
      startDate: '2024-08-02',
      endDate: '2024-08-04',
      notes: 'Rustgevend weekend op het Veerse Meer, met aanleggen in Veere en Kortgene.',
      crewIds: ['crew-d1', 'crew-d2'],
      createdAt: '2024-07-28T10:00:00Z',
    },
  ];

  // ── Tochten ──────────────────────────────────────────────────────────────
  const trips = [
    // ─ Reis Delta Voorjaarstocht ─
    {
      id: 'trip-d9',
      from: 'Middelburg', to: 'Zierikzee',
      departureDate: '2024-05-17', departureTime: '08:30',
      arrivalDate: '2024-05-17',   arrivalTime: '13:45',
      distance: '25', avgSpeed: '7.2',
      engineHoursDeparture: '1200', engineHoursArrival: '1205',
      harborFee: '24.00',
      windForce: '3', windDirection: 'ZW', visibility: 'goed (>5 nm)',
      weather: 'halfbewolkt', waterLevel: '68', waterRefilled: false,
      batteryPercent: '82', solarKwh: '1.2', notes: 'Mooie vaart, lichte ZW-wind. Aanleggen in Havenkanaal Zierikzee.',
      crewIds: ['crew-d1', 'crew-d2', 'crew-d3'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d3', isDayLog: false, tempCrew: [], createdAt: '2024-05-17T14:00:00Z',
    },
    {
      id: 'trip-d10',
      from: 'Zierikzee', to: 'Bruinisse',
      departureDate: '2024-05-18', departureTime: '09:00',
      arrivalDate: '2024-05-18',   arrivalTime: '12:30',
      distance: '18', avgSpeed: '6.8',
      engineHoursDeparture: '1205', engineHoursArrival: '1209',
      harborFee: '18.50',
      windForce: '4', windDirection: 'W', visibility: 'goed (>5 nm)',
      weather: 'bewolkt', waterLevel: '65', waterRefilled: false,
      batteryPercent: '78', solarKwh: '0.8', notes: 'Stevige westenwind, golfjes op het Grevelingenmeer.',
      crewIds: ['crew-d1', 'crew-d2', 'crew-d3'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d3', isDayLog: false, tempCrew: [], createdAt: '2024-05-18T13:00:00Z',
    },
    {
      id: 'trip-d11',
      from: 'Bruinisse', to: 'Middelburg',
      departureDate: '2024-05-19', departureTime: '08:00',
      arrivalDate: '2024-05-19',   arrivalTime: '13:20',
      distance: '30', avgSpeed: '6.5',
      engineHoursDeparture: '1209', engineHoursArrival: '1216',
      harborFee: '0',
      windForce: '2', windDirection: 'N', visibility: 'goed (>5 nm)',
      weather: 'zonnig', waterLevel: '60', waterRefilled: false,
      batteryPercent: '88', solarKwh: '2.4', notes: 'Zonnige terugtocht via Veerse Meer. Prachtig zicht.',
      crewIds: ['crew-d1', 'crew-d2', 'crew-d3'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d3', isDayLog: false, tempCrew: [], createdAt: '2024-05-19T14:00:00Z',
    },

    // ─ Reis Westerschelde Zomertocht ─
    {
      id: 'trip-d1',
      from: 'Middelburg', to: 'Vlissingen',
      departureDate: '2024-07-12', departureTime: '09:00',
      arrivalDate: '2024-07-12',   arrivalTime: '12:30',
      distance: '18', avgSpeed: '6.0',
      engineHoursDeparture: '1224', engineHoursArrival: '1228',
      harborFee: '12.50',
      windForce: '3', windDirection: 'ZW', visibility: 'goed (>5 nm)',
      weather: 'zonnig', waterLevel: '72', waterRefilled: false,
      batteryPercent: '85', solarKwh: '1.8', notes: 'Prettige vaart via het Kanaal door Walcheren.',
      crewIds: ['crew-d1', 'crew-d2', 'crew-d3'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d1', isDayLog: false, tempCrew: [], createdAt: '2024-07-12T13:00:00Z',
    },
    {
      id: 'trip-d2',
      from: 'Vlissingen', to: 'Breskens',
      departureDate: '2024-07-13', departureTime: '10:00',
      arrivalDate: '2024-07-13',   arrivalTime: '13:45',
      distance: '12', avgSpeed: '6.5',
      engineHoursDeparture: '1230', engineHoursArrival: '1234',
      harborFee: '18.00',
      windForce: '4', windDirection: 'W', visibility: 'goed (>5 nm)',
      weather: 'halfbewolkt', waterLevel: '70', waterRefilled: false,
      batteryPercent: '80', solarKwh: '1.0', notes: 'Stroom mee op de Westerschelde, vlotte oversteek.',
      crewIds: ['crew-d1', 'crew-d2', 'crew-d3'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d1', isDayLog: false, tempCrew: [], createdAt: '2024-07-13T14:00:00Z',
    },
    {
      id: 'trip-d3',
      from: 'Breskens', to: 'Terneuzen',
      departureDate: '2024-07-14', departureTime: '08:30',
      arrivalDate: '2024-07-14',   arrivalTime: '15:00',
      distance: '22', avgSpeed: '6.0',
      engineHoursDeparture: '1235', engineHoursArrival: '1242',
      harborFee: '22.00',
      windForce: '5', windDirection: 'WZW', visibility: 'matig (1–5 nm)',
      weather: 'bewolkt', waterLevel: '65', waterRefilled: false,
      batteryPercent: '74', solarKwh: '0.5', notes: 'Stevige bries, regelmatig schepen van Westerschelde Ferry in de buurt.',
      crewIds: ['crew-d1', 'crew-d2', 'crew-d3'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d1', isDayLog: false, tempCrew: [], createdAt: '2024-07-14T15:30:00Z',
    },
    {
      id: 'trip-d4',
      from: 'Terneuzen', to: 'Hansweert',
      departureDate: '2024-07-15', departureTime: '09:30',
      arrivalDate: '2024-07-15',   arrivalTime: '15:00',
      distance: '28', avgSpeed: '7.0',
      engineHoursDeparture: '1242', engineHoursArrival: '1250',
      harborFee: '15.00',
      windForce: '3', windDirection: 'NO', visibility: 'goed (>5 nm)',
      weather: 'zonnig', waterLevel: '62', waterRefilled: false,
      batteryPercent: '87', solarKwh: '2.1', notes: 'Prachtige zonnige dag op de Westerschelde.',
      crewIds: ['crew-d1', 'crew-d2', 'crew-d3'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d1', isDayLog: false, tempCrew: [], createdAt: '2024-07-15T15:30:00Z',
    },
    {
      id: 'trip-d5',
      from: 'Hansweert', to: 'Middelburg',
      departureDate: '2024-07-16', departureTime: '08:00',
      arrivalDate: '2024-07-16',   arrivalTime: '14:30',
      distance: '20', avgSpeed: '6.2',
      engineHoursDeparture: '1250', engineHoursArrival: '1257',
      harborFee: '0',
      windForce: '2', windDirection: 'O', visibility: 'goed (>5 nm)',
      weather: 'zonnig', waterLevel: '58', waterRefilled: true,
      batteryPercent: '91', solarKwh: '2.8', notes: 'Rustige terugtocht, water bijgevuld bij thuishaven.',
      crewIds: ['crew-d1', 'crew-d2', 'crew-d3'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d1', isDayLog: false, tempCrew: [], createdAt: '2024-07-16T15:00:00Z',
    },

    // ─ Reis Veerse Meer Weekend ─
    {
      id: 'trip-d6',
      from: 'Middelburg', to: 'Veere',
      departureDate: '2024-08-02', departureTime: '11:00',
      arrivalDate: '2024-08-02',   arrivalTime: '13:30',
      distance: '8', avgSpeed: '5.8',
      engineHoursDeparture: '1265', engineHoursArrival: '1268',
      harborFee: '20.00',
      windForce: '2', windDirection: 'ZW', visibility: 'goed (>5 nm)',
      weather: 'zonnig', waterLevel: '70', waterRefilled: false,
      batteryPercent: '88', solarKwh: '3.2', notes: 'Heerlijk zomerweer. Veere middeleeuwse sfeer genoten.',
      crewIds: ['crew-d1', 'crew-d2'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d2', isDayLog: false, tempCrew: [], createdAt: '2024-08-02T14:00:00Z',
    },
    {
      id: 'trip-d7',
      from: 'Veere', to: 'Kortgene',
      departureDate: '2024-08-03', departureTime: '10:30',
      arrivalDate: '2024-08-03',   arrivalTime: '14:00',
      distance: '12', avgSpeed: '5.5',
      engineHoursDeparture: '1270', engineHoursArrival: '1273',
      harborFee: '16.50',
      windForce: '3', windDirection: 'NW', visibility: 'goed (>5 nm)',
      weather: 'halfbewolkt', waterLevel: '67', waterRefilled: false,
      batteryPercent: '82', solarKwh: '1.6', notes: 'Rustige oversteek. Zwemmen voor het anker in de bocht bij Noord-Beveland.',
      crewIds: ['crew-d1', 'crew-d2'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d2', isDayLog: false, tempCrew: [], createdAt: '2024-08-03T14:30:00Z',
    },
    {
      id: 'trip-d8',
      from: 'Kortgene', to: 'Middelburg',
      departureDate: '2024-08-04', departureTime: '09:00',
      arrivalDate: '2024-08-04',   arrivalTime: '11:30',
      distance: '10', avgSpeed: '6.0',
      engineHoursDeparture: '1273', engineHoursArrival: '1276',
      harborFee: '0',
      windForce: '2', windDirection: 'Z', visibility: 'goed (>5 nm)',
      weather: 'zonnig', waterLevel: '64', waterRefilled: false,
      batteryPercent: '90', solarKwh: '2.5', notes: 'Kalme terugtocht in de ochtendzon.',
      crewIds: ['crew-d1', 'crew-d2'], invoiceIds: [], photoIds: [],
      reisId: 'reis-d2', isDayLog: false, tempCrew: [], createdAt: '2024-08-04T12:00:00Z',
    },

    // ─ Losse tochten ─
    {
      id: 'trip-d12',
      from: 'Middelburg', to: 'Wolphaartsdijk',
      departureDate: '2024-09-14', departureTime: '10:00',
      arrivalDate: '2024-09-14',   arrivalTime: '14:30',
      distance: '15', avgSpeed: '6.0',
      engineHoursDeparture: '1285', engineHoursArrival: '1291',
      harborFee: '14.00',
      windForce: '4', windDirection: 'W', visibility: 'goed (>5 nm)',
      weather: 'bewolkt', waterLevel: '55', waterRefilled: false,
      batteryPercent: '75', solarKwh: '0.6', notes: 'Herfststemming op het Veerse Meer.',
      crewIds: ['crew-d1', 'crew-d2'], invoiceIds: [], photoIds: [],
      reisId: '', isDayLog: false, tempCrew: [], createdAt: '2024-09-14T15:00:00Z',
    },
    {
      id: 'trip-d13',
      from: 'Middelburg', to: 'Yerseke',
      departureDate: '2024-10-05', departureTime: '09:00',
      arrivalDate: '2024-10-05',   arrivalTime: '13:30',
      distance: '22', avgSpeed: '6.3',
      engineHoursDeparture: '1300', engineHoursArrival: '1307',
      harborFee: '16.00',
      windForce: '3', windDirection: 'ZZW', visibility: 'goed (>5 nm)',
      weather: 'halfbewolkt', waterLevel: '50', waterRefilled: false,
      batteryPercent: '72', solarKwh: '0.9', notes: 'Mossels gegeten in Yerseke, een traditie.',
      crewIds: ['crew-d1', 'crew-d2'], invoiceIds: [], photoIds: [],
      reisId: '', isDayLog: false, tempCrew: [], createdAt: '2024-10-05T14:00:00Z',
    },
  ];

  // ── Brandstof ────────────────────────────────────────────────────────────
  const fuel = [
    {
      id: 'fuel-d4',
      date: '2024-05-18', location: 'Jachthaven Bruinisse',
      engineHours: '1209', liters: '110', pricePerLiter: '1.85',
      notes: 'Tankstation aan het havenkanaal.', invoiceIds: [], createdAt: '2024-05-18T12:45:00Z',
    },
    {
      id: 'fuel-d1',
      date: '2024-07-13', location: 'Vlissingen Paspoortjachthaven',
      engineHours: '1230', liters: '120', pricePerLiter: '1.89',
      notes: 'Getankt na de aankomst.', invoiceIds: [], createdAt: '2024-07-13T15:00:00Z',
    },
    {
      id: 'fuel-d2',
      date: '2024-07-15', location: 'Terneuzen Jachthaven',
      engineHours: '1242', liters: '90', pricePerLiter: '1.87',
      notes: 'Tank bijgevuld voor de rit naar Hansweert.', invoiceIds: [], createdAt: '2024-07-15T09:00:00Z',
    },
    {
      id: 'fuel-d3',
      date: '2024-08-03', location: 'Veere Jachthaven',
      engineHours: '1270', liters: '85', pricePerLiter: '1.94',
      notes: '', invoiceIds: [], createdAt: '2024-08-03T10:00:00Z',
    },
    {
      id: 'fuel-d5',
      date: '2024-09-14', location: 'Middelburg Jachthaven',
      engineHours: '1291', liters: '140', pricePerLiter: '1.91',
      notes: 'Wintervoorraad gedeeltelijk aangevuld.', invoiceIds: [], createdAt: '2024-09-14T15:30:00Z',
    },
    {
      id: 'fuel-d6',
      date: '2024-10-05', location: 'Jachthaven Yerseke',
      engineHours: '1307', liters: '65', pricePerLiter: '1.93',
      notes: '', invoiceIds: [], createdAt: '2024-10-05T14:00:00Z',
    },
  ];

  // ── Exploitatiekosten ─────────────────────────────────────────────────────
  const repairs = [
    {
      id: 'rep-d1',
      date: '2024-01-01', description: 'Jachthavenabonnement',
      cost: '2400', costType: 'jaarlijks',
      supplier: 'Jachthaven Middelburg', engineHours: '',
      notes: 'Jaarlijks liggeld vaste ligplaats box B-47.', invoiceIds: [], createdAt: '2024-01-01T10:00:00Z',
    },
    {
      id: 'rep-d2',
      date: '2024-01-01', description: 'WA/Casco verzekering',
      cost: '1250', costType: 'jaarlijks',
      supplier: 'Nationale-Nederlanden', engineHours: '',
      notes: 'Inclusief dekking buitenland (EU).', invoiceIds: [], createdAt: '2024-01-01T10:01:00Z',
    },
    {
      id: 'rep-d3',
      date: '2024-04-15', description: 'Jaarlijks motoronderhoud',
      cost: '895', costType: 'jaarlijks',
      supplier: 'Motorservice Delta', engineHours: '1198',
      notes: 'Olieverversing, filters, koelvloeistof check, V-snaar.', invoiceIds: [], createdAt: '2024-04-15T14:00:00Z',
    },
    {
      id: 'rep-d4',
      date: '2024-04-10', description: 'Antifouling onderwaterschip',
      cost: '480', costType: 'jaarlijks',
      supplier: 'Zeeland Jachtonderhoud', engineHours: '',
      notes: 'Twee lagen antifouling aangebracht na winterstalling.', invoiceIds: [], createdAt: '2024-04-10T11:00:00Z',
    },
    {
      id: 'rep-d5',
      date: '2024-04-20', description: 'ANWB Waterweg Vignetten',
      cost: '165', costType: 'jaarlijks',
      supplier: 'ANWB', engineHours: '',
      notes: 'Jaarlijks vignetten pakket Zeeland, NL en België.', invoiceIds: [], createdAt: '2024-04-20T09:00:00Z',
    },
    {
      id: 'rep-d6',
      date: '2024-02-20', description: 'Vervanging staartstuk',
      cost: '1450', costType: 'eenmalig',
      supplier: 'Motorservice Delta', engineHours: '',
      notes: 'Staartstuk vertoonde lek, volledig vervangen inclusief afdichtingen.', invoiceIds: [], createdAt: '2024-02-20T16:00:00Z',
    },
    {
      id: 'rep-d7',
      date: '2024-03-08', description: 'Reparatie radar Garmin',
      cost: '380', costType: 'eenmalig',
      supplier: 'Marinetech Zeeland', engineHours: '',
      notes: 'Radarscherm defect na waterinslag, display vervangen.', invoiceIds: [], createdAt: '2024-03-08T15:00:00Z',
    },
    {
      id: 'rep-d8',
      date: '2024-03-12', description: 'Nieuwe elektrische ankerwinch',
      cost: '1890', costType: 'eenmalig',
      supplier: 'Zeilmakerij Goes', engineHours: '',
      notes: 'Oude handbediende winch vervangen door Maxwell elektrisch model.', invoiceIds: [], createdAt: '2024-03-12T13:00:00Z',
    },
    {
      id: 'rep-d9',
      date: '2024-06-22', description: 'Cockpit bekleding vernieuwd',
      cost: '650', costType: 'eenmalig',
      supplier: 'Zeeland Jachtonderhoud', engineHours: '1224',
      notes: 'Originele bekledingsmatten verweerd, nieuwe UV-bestendige matten gemonteerd.', invoiceIds: [], createdAt: '2024-06-22T14:00:00Z',
    },
  ];

  // ── Daglogboek ────────────────────────────────────────────────────────────
  const dayLogs = [
    {
      id: 'daylog-d1',
      date: '2024-07-01', location: 'Middelburg',
      waterLevel: '72', waterRefilled: false,
      batteryPercent: '85', solarKwh: '2.8',
      notes: 'Klaargemaakt voor vertrek Westerschelde tocht. Alles gecontroleerd.',
      createdAt: '2024-07-01T19:00:00Z',
    },
    {
      id: 'daylog-d2',
      date: '2024-08-20', location: 'Middelburg',
      waterLevel: '65', waterRefilled: false,
      batteryPercent: '90', solarKwh: '3.5',
      notes: 'Mooie zomerse dag in de haven. Boot gewassen en gepoetst.',
      createdAt: '2024-08-20T18:00:00Z',
    },
    {
      id: 'daylog-d3',
      date: '2024-09-10', location: 'Middelburg',
      waterLevel: '58', waterRefilled: false,
      batteryPercent: '78', solarKwh: '1.4',
      notes: 'Begin herfst merkbaar. Inventarisatie voorbereidingen winterstalling.',
      createdAt: '2024-09-10T17:00:00Z',
    },
    {
      id: 'daylog-d4',
      date: '2024-10-15', location: 'Middelburg',
      waterLevel: '45', waterRefilled: false,
      batteryPercent: '70', solarKwh: '0.8',
      notes: 'Laatste check voor de winterstalling. Buiten seizoen.',
      createdAt: '2024-10-15T16:00:00Z',
    },
  ];

  // ── Seizoenstart ─────────────────────────────────────────────────────────
  const seizoen = [
    {
      id: 'sz-d1',
      date: '2024-04-15', location: 'Jachthaven Middelburg',
      engineHours: '1198', batteryPercent: '80', waterLevel: '70',
      notes: 'Seizoensopening 2024. Boot te water gelaten na winterstalling. Alles in orde bevonden.',
      createdAt: '2024-04-15T11:00:00Z',
    },
  ];

  // ── Onderhoudstaken ───────────────────────────────────────────────────────
  // Huidige motorstand demo: ~1307 uur. Datum: 2026-03-20
  const maintenance = [
    {
      id: 'maint-d1',
      description: 'Motorolie + oliefilter',
      intervalHours: '250', intervalDays: '',
      lastDoneHours: '1100', lastDoneDate: '2024-04-15',
      notes: 'Castrol GTX 15W-40, filter: Mann W 811/80',
      createdAt: '2024-01-01T10:00:00Z',
    },
    {
      id: 'maint-d2',
      description: 'Impeller koelwaterpomp',
      intervalHours: '300', intervalDays: '',
      lastDoneHours: '1000', lastDoneDate: '2023-08-20',
      notes: 'Jabsco 18673-0001. Let op draairichting bij montage.',
      createdAt: '2024-01-01T10:01:00Z',
    },
    {
      id: 'maint-d3',
      description: 'Tandriemset + spanner',
      intervalHours: '1000', intervalDays: '',
      lastDoneHours: '800', lastDoneDate: '2022-05-10',
      notes: 'Inclusief waterpomp vervangen.',
      createdAt: '2024-01-01T10:02:00Z',
    },
    {
      id: 'maint-d4',
      description: 'Koelvloeistof verversen',
      intervalHours: '', intervalDays: '730',
      lastDoneHours: '', lastDoneDate: '2023-04-15',
      notes: 'Volvo Penta koelvloeistof, 50/50 mengverhouding.',
      createdAt: '2024-01-01T10:03:00Z',
    },
    {
      id: 'maint-d5',
      description: 'Antifouling onderwaterschip',
      intervalHours: '', intervalDays: '365',
      lastDoneHours: '', lastDoneDate: '2024-04-10',
      notes: 'Hempel Hard Racing, 2 lagen. Spuiten na slijpen.',
      createdAt: '2024-01-01T10:04:00Z',
    },
    {
      id: 'maint-d6',
      description: 'Luchtfilter motor',
      intervalHours: '500', intervalDays: '',
      lastDoneHours: '900', lastDoneDate: '2023-06-01',
      notes: '',
      createdAt: '2024-01-01T10:05:00Z',
    },
    {
      id: 'maint-d7',
      description: 'Vlamblusser keuring',
      intervalHours: '', intervalDays: '365',
      lastDoneHours: '', lastDoneDate: '2024-04-15',
      notes: 'ADAC-gecertificeerd, bewaard in navigatiehoek.',
      createdAt: '2024-01-01T10:06:00Z',
    },
    {
      id: 'maint-d8',
      description: 'Roestvrij staal & beslag inspecteren',
      intervalHours: '', intervalDays: '180',
      lastDoneHours: '', lastDoneDate: '2024-10-01',
      notes: 'Controleer op pitting en galvanische corrosie. Behandelen met Lanolin.',
      createdAt: '2024-01-01T10:07:00Z',
    },
  ];

  // ── Schrijven naar localStorage ──────────────────────────────────────────
  localStorage.setItem(BOOT_KEY,    JSON.stringify(boot));
  localStorage.setItem(CREW_KEY,    JSON.stringify(crew));
  localStorage.setItem(REIZEN_KEY,  JSON.stringify(reizen));
  localStorage.setItem(TRIPS_KEY,   JSON.stringify(trips));
  localStorage.setItem(FUEL_KEY,    JSON.stringify(fuel));
  localStorage.setItem(REPAIRS_KEY, JSON.stringify(repairs));
  localStorage.setItem(DAYLOG_KEY,  JSON.stringify(dayLogs));
  localStorage.setItem(SEIZOEN_KEY, JSON.stringify(seizoen));
  localStorage.setItem(MAINT_KEY,   JSON.stringify(maintenance));
  localStorage.setItem(DEMO_ACTIVE_KEY, '1');

  window.location.reload();
}

export function restoreRealData() {
  restoreBackup();
  localStorage.removeItem(DEMO_ACTIVE_KEY);
  window.location.reload();
}

export function clearAllData() {
  DATA_KEYS.forEach(k => localStorage.removeItem(k));
  localStorage.removeItem(DEMO_ACTIVE_KEY);
  window.location.reload();
}
