import type { FuelEntry } from '../types';
import { formatDate } from '../utils/format';
import { useTranslation } from '../i18n';

interface Props {
  entries: FuelEntry[];
  onView: (id: string) => void;
  onNew: () => void;
}

/** Sort entries by engine hours ascending; fall back to date. */
function sortedByHours(entries: FuelEntry[]): FuelEntry[] {
  return [...entries].sort((a, b) => {
    const ha = parseFloat(a.engineHours);
    const hb = parseFloat(b.engineHours);
    if (!isNaN(ha) && !isNaN(hb)) return ha - hb;
    return a.date.localeCompare(b.date);
  });
}

/** Liters per engine hour between two consecutive fill-ups. */
function consumption(prev: FuelEntry, curr: FuelEntry): string | null {
  const liter = parseFloat(curr.liters);
  const hPrev = parseFloat(prev.engineHours);
  const hCurr = parseFloat(curr.engineHours);
  if (isNaN(liter) || isNaN(hPrev) || isNaN(hCurr)) return null;
  const diff = hCurr - hPrev;
  if (diff <= 0) return null;
  return (liter / diff).toFixed(2);
}

export default function FuelLog({ entries, onView, onNew }: Props) {
  const { t } = useTranslation();
  const sorted = sortedByHours(entries);

  const totalLiters = entries.reduce((s, e) => s + (parseFloat(e.liters) || 0), 0);
  const totalCost   = entries.reduce((s, e) => {
    const l = parseFloat(e.liters) || 0;
    const p = parseFloat(e.pricePerLiter) || 0;
    return s + l * p;
  }, 0);

  if (entries.length === 0) {
    return (
      <div className="trip-empty">
        <div className="trip-empty-icon">&#9981;</div>
        <h2>{t('fuel.empty.title')}</h2>
        <p>{t('fuel.empty.text')}</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={onNew}>
          {t('fuel.empty.btn')}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{entries.length}</div>
          <div className="stat-label">{t('fuel.stat.count')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalLiters.toFixed(0)} L</div>
          <div className="stat-label">{t('fuel.stat.total')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">&euro; {totalCost.toFixed(0)}</div>
          <div className="stat-label">{t('fuel.stat.cost')}</div>
        </div>
      </div>

      <div className="trip-list">
        {/* Show in reverse (newest first) but use sorted for consumption calc */}
        {[...sorted].reverse().map((entry) => {
          const origIdx = sorted.indexOf(entry);
          const prev    = origIdx > 0 ? sorted[origIdx - 1] : null;
          const cons    = prev ? consumption(prev, entry) : null;
          const cost    = (parseFloat(entry.liters) || 0) * (parseFloat(entry.pricePerLiter) || 0);

          return (
            <div key={entry.id} className="trip-card fuel-card" onClick={() => onView(entry.id)}>
              <div className="trip-card-header">
                <div className="trip-route">
                  {entry.location || t('fuel.unknown')}
                </div>
                <div className="trip-date">{formatDate(entry.date)}</div>
              </div>
              <div className="trip-badges">
                {entry.liters && (
                  <span className="badge badge-blue">{entry.liters} L</span>
                )}
                {entry.pricePerLiter && (
                  <span className="badge badge-grey">&euro; {parseFloat(entry.pricePerLiter).toFixed(3)}/L</span>
                )}
                {cost > 0 && (
                  <span className="badge badge-orange">&euro; {cost.toFixed(2)}</span>
                )}
                {cons && (
                  <span className="badge badge-green">{cons} L/u</span>
                )}
                {entry.engineHours && (
                  <span className="badge badge-grey">{entry.engineHours} u</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
