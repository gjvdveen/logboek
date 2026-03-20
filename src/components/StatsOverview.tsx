import { useState, useMemo } from 'react';
import type { Trip, FuelEntry, RepairEntry, DayLog, Reis } from '../types';
import { useTranslation } from '../i18n';

interface Props {
  trips: Trip[];
  fuelEntries: FuelEntry[];
  repairEntries: RepairEntry[];
  dayLogs: DayLog[];
  reizen: Reis[];
  bootNaam: string;
  bootType?: string;
  bannerUrl?: string;
}

type FilterMode = 'all' | 'year' | 'period' | 'reis';

function tripDates(trip: Trip): string[] {
  if (!trip.departureDate) return [];
  const start = new Date(trip.departureDate + 'T12:00:00');
  const end   = trip.arrivalDate ? new Date(trip.arrivalDate + 'T12:00:00') : start;
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function inRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

function fmt(n: number) {
  return n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}-${m}-${y}`;
}

function CostBar({ label, amount, total, color, children }: {
  label: string; amount: number; total: number; color: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  const hasDetails = !!children;
  return (
    <div className={`cost-bar-row${open ? ' cost-bar-row--open' : ''}`}>
      <div className="cost-bar-header">
        <button
          type="button"
          className={`cost-bar-toggle${hasDetails ? '' : ' cost-bar-toggle--hidden'}`}
          onClick={() => hasDetails && setOpen(v => !v)}
          aria-expanded={open}
        >{open ? '▾' : '▸'}</button>
        <span className="cost-bar-label">{label}</span>
        <span className="cost-bar-amount">&euro;&nbsp;{fmt(amount)}</span>
      </div>
      <div className="cost-bar-track">
        <div className="cost-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="cost-bar-pct">{pct}%</div>
      {(open || !hasDetails) && hasDetails && (
        <div className="cost-bar-details">
          {children}
        </div>
      )}
    </div>
  );
}

function DetailRow({ date, desc, amount }: { date: string; desc: string; amount: number }) {
  return (
    <div className="cost-detail-row">
      <span className="cost-detail-date">{fmtDate(date)}</span>
      <span className="cost-detail-desc">{desc}</span>
      <span className="cost-detail-amount">&euro;&nbsp;{fmt(amount)}</span>
    </div>
  );
}

export default function StatsOverview({ trips, fuelEntries, repairEntries, dayLogs, reizen, bootNaam, bootType, bannerUrl }: Props) {
  const { t } = useTranslation();

  // ── All available years ──
  const years = useMemo(() => {
    const s = new Set<string>();
    trips.forEach(x => { if (x.departureDate) s.add(x.departureDate.slice(0, 4)); });
    fuelEntries.forEach(x => { if (x.date) s.add(x.date.slice(0, 4)); });
    repairEntries.forEach(x => { if (x.date) s.add(x.date.slice(0, 4)); });
    dayLogs.forEach(x => { if (x.date) s.add(x.date.slice(0, 4)); });
    return [...s].sort((a, b) => b.localeCompare(a));
  }, [trips, fuelEntries, repairEntries, dayLogs]);

  const [filterMode,      setFilterMode]      = useState<FilterMode>(() => years.length > 0 ? 'year' : 'all');
  const [selectedYear,    setSelectedYear]    = useState<string>(() => years[0] ?? '');
  const [periodFrom,      setPeriodFrom]      = useState('');
  const [periodTo,        setPeriodTo]        = useState('');
  const [selectedReisId,  setSelectedReisId]  = useState<string>('');

  // ── Cost type filters ──
  const [showLiggeld,  setShowLiggeld]  = useState(true);
  const [showFuel,     setShowFuel]     = useState(true);
  const [showRepair,   setShowRepair]   = useState(true);
  const [showFixed,    setShowFixed]    = useState(true);

  // ── Trips belonging to selected reis (for reis filter mode) ──
  const reisTrips = useMemo(() => {
    if (filterMode !== 'reis' || !selectedReisId) return null;
    return trips.filter(x => x.reisId === selectedReisId);
  }, [filterMode, selectedReisId, trips]);

  // ── Derive date range ──
  const { from, to } = useMemo(() => {
    if (filterMode === 'year' && selectedYear) {
      return { from: `${selectedYear}-01-01`, to: `${selectedYear}-12-31` };
    }
    if (filterMode === 'period') {
      return { from: periodFrom, to: periodTo };
    }
    if (filterMode === 'reis' && reisTrips && reisTrips.length > 0) {
      const dates = reisTrips.flatMap(x => [x.departureDate, x.arrivalDate].filter(Boolean) as string[]);
      return { from: dates.reduce((a, b) => a < b ? a : b), to: dates.reduce((a, b) => a > b ? a : b) };
    }
    return { from: '', to: '' };
  }, [filterMode, selectedYear, periodFrom, periodTo, reisTrips]);

  function matchesRange(date: string) {
    if (!from && !to) return true;
    if (from && to) return inRange(date, from, to);
    if (from) return date >= from;
    if (to)   return date <= to;
    return true;
  }

  // ── Filtered data ──
  const filteredTrips   = useMemo(() => reisTrips ?? trips.filter(x => matchesRange(x.departureDate)), [reisTrips, trips, from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  const filteredFuel    = useMemo(() => fuelEntries.filter(x => matchesRange(x.date)), [fuelEntries, from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  const filteredRepair  = useMemo(() => repairEntries.filter(x => matchesRange(x.date) && x.costType !== 'jaarlijks'), [repairEntries, from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  const filteredFixed   = useMemo(() => repairEntries.filter(x => matchesRange(x.date) && x.costType === 'jaarlijks'), [repairEntries, from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  const filteredDayLogs = useMemo(() => dayLogs.filter(x => matchesRange(x.date)), [dayLogs, from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stats ──
  const motorHours = useMemo(() => filteredTrips.reduce((sum, trip) => {
    const dep = parseFloat(trip.engineHoursDeparture);
    const arr = parseFloat(trip.engineHoursArrival);
    return (!isNaN(dep) && !isNaN(arr) && arr >= dep) ? sum + (arr - dep) : sum;
  }, 0), [filteredTrips]);

  const sailingDates = useMemo(() => {
    const s = new Set<string>();
    filteredTrips.forEach(trip => tripDates(trip).forEach(d => s.add(d)));
    return s;
  }, [filteredTrips]);

  const mooredDates = useMemo(() => {
    const s = new Set<string>();
    filteredDayLogs.forEach(x => { if (x.date) s.add(x.date); });
    return s;
  }, [filteredDayLogs]);

  const distance    = useMemo(() => filteredTrips.reduce((s, x) => s + (parseFloat(x.distance)  || 0), 0), [filteredTrips]);
  const harborFees  = useMemo(() => filteredTrips.reduce((s, x) => s + (parseFloat(x.harborFee) || 0), 0), [filteredTrips]);
  const fuelLiters  = useMemo(() => filteredFuel.reduce((s, x) => s + (parseFloat(x.liters) || 0), 0), [filteredFuel]);
  const fuelCost    = useMemo(() => filteredFuel.reduce((s, x) => {
    return s + (parseFloat(x.liters) || 0) * (parseFloat(x.pricePerLiter) || 0);
  }, 0), [filteredFuel]);
  const repairCost  = useMemo(() => filteredRepair.reduce((s, x) => s + (parseFloat(x.cost) || 0), 0), [filteredRepair]);
  const fixedCost   = useMemo(() => filteredFixed.reduce((s, x)  => s + (parseFloat(x.cost) || 0), 0), [filteredFixed]);

  // All jaarlijks repairs (not date-filtered) for annual overview
  const allFixedCost = useMemo(() => repairEntries
    .filter(x => x.costType === 'jaarlijks')
    .reduce((s, x) => s + (parseFloat(x.cost) || 0), 0), [repairEntries]);

  const waterRefills = useMemo(() => {
    const fromTrips   = filteredTrips.filter(x => x.waterRefilled).length;
    const fromDayLogs = filteredDayLogs.filter(x => x.waterRefilled).length;
    return fromTrips + fromDayLogs;
  }, [filteredTrips, filteredDayLogs]);

  const totalSolarKwh = useMemo(() => {
    const fromTrips   = filteredTrips.reduce((s, x) => s + (parseFloat(x.solarKwh) || 0), 0);
    const fromDayLogs = filteredDayLogs.reduce((s, x) => s + (parseFloat(x.solarKwh) || 0), 0);
    return fromTrips + fromDayLogs;
  }, [filteredTrips, filteredDayLogs]);

  const fuelPerHour = motorHours > 0 && fuelLiters > 0 ? (fuelLiters / motorHours).toFixed(2) : null;
  const fuelPerEuro = fuelCost > 0 && fuelLiters > 0   ? (fuelCost  / fuelLiters).toFixed(3)  : null;

  // ── Selected cost totals for filtered cost card ──
  const selectedCostTotal = (showLiggeld ? harborFees : 0)
    + (showFuel    ? fuelCost   : 0)
    + (showRepair  ? repairCost : 0)
    + (showFixed   ? fixedCost  : 0);

  const totalDays = sailingDates.size + mooredDates.size;
  const sailRatio = totalDays > 0 ? Math.round((sailingDates.size / totalDays) * 100) : null;

  // ── Print period label ──
  const periodLabel = useMemo(() => {
    if (filterMode === 'all')    return t('stats.total');
    if (filterMode === 'year')   return selectedYear;
    if (filterMode === 'reis') {
      const r = reizen.find(x => x.id === selectedReisId);
      return r ? `${t('stats.reis')}: ${r.name}` : t('stats.reis');
    }
    if (filterMode === 'period') {
      const parts = [periodFrom, periodTo].filter(Boolean);
      return parts.length === 2 ? `${periodFrom} – ${periodTo}` : parts[0] ?? '';
    }
    return '';
  }, [filterMode, selectedYear, selectedReisId, periodFrom, periodTo, reizen, t]);

  const printDate = new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' });

  const hasAnyData = years.length > 0;

  if (!hasAnyData) {
    return (
      <div className="trip-empty">
        <div className="trip-empty-icon">&#128200;</div>
        <h2>{t('stats.empty.title')}</h2>
        <p>{t('stats.empty.text')}</p>
      </div>
    );
  }

  return (
    <div className="rapportage-page">

      {/* ── Print-only header ── */}
      <div className="print-header">
        {bannerUrl ? (
          <div className="print-banner-wrap">
            <img src={bannerUrl} alt="" className="print-banner-img" />
            <div className="print-banner-overlay" />
            <div className="print-banner-text">
              {bootNaam && <div className="print-banner-name">{bootNaam}</div>}
              {bootType && <div className="print-banner-type">{bootType}</div>}
            </div>
          </div>
        ) : (bootNaam || bootType) ? (
          <div className="print-banner-textonly">
            {bootNaam && <div className="print-banner-name-dark">{bootNaam}</div>}
            {bootType && <div className="print-banner-type-dark">{bootType}</div>}
          </div>
        ) : null}
        <div className="print-header-title">{t('nav.stats')}</div>
        <div className="print-header-sub">{periodLabel}</div>
        <div className="print-header-date">{printDate}</div>
      </div>

      {/* ── Toolbar ── */}
      <div className="rapport-toolbar">
        <button className="btn btn-secondary btn-pdf" onClick={() => window.print()}>
          ↓ PDF
        </button>
      </div>

      {/* ── Periode filter ── */}
      <div className="rapport-filter-block">
        <div className="rapport-filter-label">{t('stats.period')}</div>
        <div className="year-pills">
          <button
            className={`year-pill${filterMode === 'all' ? ' year-pill--active' : ''}`}
            onClick={() => setFilterMode('all')}
          >{t('stats.total')}</button>
          {years.map(y => (
            <button key={y}
              className={`year-pill${filterMode === 'year' && selectedYear === y ? ' year-pill--active' : ''}`}
              onClick={() => { setFilterMode('year'); setSelectedYear(y); }}
            >{y}</button>
          ))}
          <button
            className={`year-pill${filterMode === 'period' ? ' year-pill--active' : ''}`}
            onClick={() => setFilterMode('period')}
          >{t('stats.period')}</button>
          {reizen.length > 0 && (
            <button
              className={`year-pill${filterMode === 'reis' ? ' year-pill--active' : ''}`}
              onClick={() => { setFilterMode('reis'); if (!selectedReisId && reizen.length > 0) setSelectedReisId(reizen[reizen.length - 1].id); }}
            >{t('stats.reis')}</button>
          )}
        </div>
        {filterMode === 'reis' && (
          <div style={{ marginTop: '10px' }}>
            <select className="form-control" value={selectedReisId} onChange={e => setSelectedReisId(e.target.value)}>
              <option value="">{t('stats.reis.select')}</option>
              {[...reizen].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}
        {filterMode === 'period' && (
          <div className="period-inputs">
            <div className="period-input-group">
              <label>{t('stats.period.from')}</label>
              <input type="date" className="form-control" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} />
            </div>
            <div className="period-input-group">
              <label>{t('stats.period.to')}</label>
              <input type="date" className="form-control" value={periodTo} min={periodFrom || undefined} onChange={e => setPeriodTo(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* ── Kostenfilter ── */}
      <div className="rapport-filter-block">
        <div className="rapport-filter-label">{t('stats.filter.costs')}</div>
        <div className="cost-filter-toggles">
          <button className={`cost-filter-btn${showLiggeld ? ' active' : ''}`} onClick={() => setShowLiggeld(v => !v)}>
            ⚓ {t('stats.filter.liggeld')}
          </button>
          <button className={`cost-filter-btn${showFuel ? ' active' : ''}`} onClick={() => setShowFuel(v => !v)}>
            ⛽ {t('stats.filter.fuel')}
          </button>
          <button className={`cost-filter-btn${showRepair ? ' active' : ''}`} onClick={() => setShowRepair(v => !v)}>
            🔧 {t('stats.filter.repair')}
          </button>
          <button className={`cost-filter-btn${showFixed ? ' active' : ''}`} onClick={() => setShowFixed(v => !v)}>
            📋 {t('stats.filter.fixed')}
          </button>
        </div>
      </div>

      <div className="overview-cards">

        {/* ── Vaartochten ── */}
        <div className="ov-card">
          <div className="ov-card-title">{t('stats.trips.title')}</div>
          <div className="ov-big-row">
            <div className="ov-big">
              <div className="ov-big-val">{filteredTrips.length}</div>
              <div className="ov-big-lbl">{t('stats.trips')}</div>
            </div>
            <div className="ov-big">
              <div className="ov-big-val">{distance.toFixed(1)}</div>
              <div className="ov-big-lbl">{t('stats.nm')}</div>
            </div>
            {sailingDates.size > 0 && (
              <div className="ov-big">
                <div className="ov-big-val">{sailingDates.size}</div>
                <div className="ov-big-lbl">{t('stats.days.sailing')}</div>
              </div>
            )}
            {mooredDates.size > 0 && (
              <div className="ov-big">
                <div className="ov-big-val">{mooredDates.size}</div>
                <div className="ov-big-lbl">{t('stats.days.moored')}</div>
              </div>
            )}
            {sailRatio !== null && (
              <div className="ov-big">
                <div className="ov-big-val">{sailRatio}%</div>
                <div className="ov-big-lbl">{t('stats.days.ratio')}</div>
              </div>
            )}
            {motorHours > 0 && (
              <div className="ov-big">
                <div className="ov-big-val">{motorHours.toFixed(1)}</div>
                <div className="ov-big-lbl">{t('stats.engine')}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Brandstof ── */}
        {showFuel && fuelLiters > 0 && (
          <div className="ov-card">
            <div className="ov-card-title">{t('stats.fuel.title')}</div>
            <div className="ov-big-row">
              <div className="ov-big">
                <div className="ov-big-val">{fuelLiters.toFixed(0)}</div>
                <div className="ov-big-lbl">{t('stats.fuel.liter')}</div>
              </div>
              {fuelPerHour && (
                <div className="ov-big">
                  <div className="ov-big-val">{fuelPerHour}</div>
                  <div className="ov-big-lbl">{t('stats.fuel.cons')}</div>
                </div>
              )}
              {fuelPerEuro && (
                <div className="ov-big">
                  <div className="ov-big-val">&euro;&nbsp;{fuelPerEuro}</div>
                  <div className="ov-big-lbl">{t('stats.fuel.price')}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Water & energie ── */}
        {(waterRefills > 0 || totalSolarKwh > 0) && (
          <div className="ov-card">
            <div className="ov-card-title">{t('stats.water.title')}</div>
            <div className="ov-big-row">
              {waterRefills > 0 && (
                <div className="ov-big">
                  <div className="ov-big-val">{waterRefills}</div>
                  <div className="ov-big-lbl">{t('stats.water.refills')}</div>
                </div>
              )}
              {totalSolarKwh > 0 && (
                <div className="ov-big">
                  <div className="ov-big-val">{totalSolarKwh.toFixed(1)}</div>
                  <div className="ov-big-lbl">{t('stats.solar')}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Kostenverdeling ── */}
        {selectedCostTotal > 0 && (
          <div className="ov-card">
            <div className="ov-card-title">{t('stats.cost.title')}</div>
            <div className="cost-bars">
              {showLiggeld && harborFees > 0 && (
                <CostBar label={t('stats.cost.harbor')} amount={harborFees} total={selectedCostTotal} color="#c9a84c">
                  {filteredTrips.filter(x => parseFloat(x.harborFee) > 0)
                    .sort((a, b) => a.departureDate.localeCompare(b.departureDate))
                    .map(x => <DetailRow key={x.id} date={x.departureDate} desc={`${x.from} → ${x.to}`} amount={parseFloat(x.harborFee)} />)}
                </CostBar>
              )}
              {showFuel && fuelCost > 0 && (
                <CostBar label={t('stats.cost.fuel')} amount={fuelCost} total={selectedCostTotal} color="#3b82f6">
                  {filteredFuel
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(x => <DetailRow key={x.id} date={x.date} desc={`${x.location}  —  ${x.liters} L`} amount={(parseFloat(x.liters) || 0) * (parseFloat(x.pricePerLiter) || 0)} />)}
                </CostBar>
              )}
              {showRepair && repairCost > 0 && (
                <CostBar label={t('stats.cost.eenmalig')} amount={repairCost} total={selectedCostTotal} color="#ef4444">
                  {filteredRepair
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(x => <DetailRow key={x.id} date={x.date} desc={x.description} amount={parseFloat(x.cost) || 0} />)}
                </CostBar>
              )}
              {showFixed && fixedCost > 0 && (
                <CostBar label={t('stats.cost.jaarlijks')} amount={fixedCost} total={selectedCostTotal} color="#8b5cf6">
                  {filteredFixed
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(x => <DetailRow key={x.id} date={x.date} desc={x.description} amount={parseFloat(x.cost) || 0} />)}
                </CostBar>
              )}
              <div className="ov-cost-row ov-cost-total" style={{ marginTop: '12px' }}>
                <span>{t('stats.cost.total')}</span>
                <span>&euro;&nbsp;{fmt(selectedCostTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Jaarlijkse vaste lasten ── */}
        {showFixed && allFixedCost > 0 && (
          <div className="ov-card ov-card--highlight">
            <div className="ov-card-title">{t('stats.fixed.annual')}</div>
            <div className="ov-big-row">
              <div className="ov-big">
                <div className="ov-big-val">&euro;&nbsp;{fmt(allFixedCost)}</div>
                <div className="ov-big-lbl">{t('stats.cost.jaarlijks')}</div>
              </div>
              <div className="ov-big">
                <div className="ov-big-val">&euro;&nbsp;{fmt(allFixedCost / 12)}</div>
                <div className="ov-big-lbl">per maand</div>
              </div>
            </div>
            <div className="fixed-cost-list">
              {repairEntries.filter(x => x.costType === 'jaarlijks').map(x => (
                <div key={x.id} className="fixed-cost-item">
                  <span>{x.description}</span>
                  <span>&euro;&nbsp;{fmt(parseFloat(x.cost) || 0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
