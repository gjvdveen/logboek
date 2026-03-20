import type { DayLog } from '../types';
import { formatDate } from '../utils/format';

interface Props {
  entries: DayLog[];
  onView: (id: string) => void;
  onNew: () => void;
}

export default function DayLogList({ entries, onView }: Props) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return (
      <div className="trip-empty">
        <div className="trip-empty-icon">&#9981;</div>
        <h2>Nog geen dagboek-entries</h2>
        <p>Registreer dagen aan boord zonder vaartocht: drinkwater, accu en zonnepanelen.</p>
      </div>
    );
  }

  return (
    <div className="trip-list">
      {sorted.map(entry => (
        <div key={entry.id} className="trip-card" onClick={() => onView(entry.id)}>
          <div className="trip-card-header">
            <div className="trip-route">{entry.location || 'Aan boord'}</div>
            <div className="trip-date">{formatDate(entry.date)}</div>
          </div>
          <div className="stats-bar">
            {entry.waterLevel && (
              <div className="stat-item">
                <span className="stat-val">{entry.waterLevel} L</span>
                <span className="stat-lbl">Water</span>
              </div>
            )}
            {entry.waterRefilled && (
              <div className="stat-item">
                <span className="stat-val">&#10003;</span>
                <span className="stat-lbl">Bijgevuld</span>
              </div>
            )}
            {entry.batteryPercent && (
              <div className="stat-item">
                <span className="stat-val">{entry.batteryPercent}%</span>
                <span className="stat-lbl">Accu</span>
              </div>
            )}
            {entry.solarKwh && (
              <div className="stat-item">
                <span className="stat-val">{entry.solarKwh} kWh</span>
                <span className="stat-lbl">Zon</span>
              </div>
            )}
          </div>
          {entry.notes && <p className="trip-notes">{entry.notes}</p>}
        </div>
      ))}
    </div>
  );
}
