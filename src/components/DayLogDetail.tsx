import type { DayLog } from '../types';
import { formatDate } from '../utils/format';

interface Props {
  entry: DayLog;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function DayLogDetail({ entry, onEdit, onDelete, onBack }: Props) {
  function handleDelete() {
    if (window.confirm(`Dagboek-entry van ${formatDate(entry.date)} verwijderen?`)) {
      onDelete();
    }
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={onBack}>&larr; Terug</button>
        <h2>Dag aan boord</h2>
      </div>

      <div className="detail-route">
        <div className="route-text">{entry.location || 'Aan boord'}</div>
        <div className="route-date">{formatDate(entry.date)}</div>
      </div>

      {(entry.waterLevel || entry.waterRefilled || entry.batteryPercent || entry.solarKwh) && (
        <div className="detail-section">
          <div className="detail-section-title">Water, accu &amp; energie</div>
          <div className="detail-grid">
            {entry.waterLevel && (
              <div className="detail-item">
                <label>Drinkwater stand</label>
                <div className="value">{entry.waterLevel} L</div>
              </div>
            )}
            {entry.waterRefilled && (
              <div className="detail-item">
                <label>Water bijgevuld</label>
                <div className="value">&#10003; Ja</div>
              </div>
            )}
            {entry.batteryPercent && (
              <div className="detail-item">
                <label>Accu stand</label>
                <div className="value">{entry.batteryPercent}%</div>
              </div>
            )}
            {entry.solarKwh && (
              <div className="detail-item">
                <label>Zonnepanelen</label>
                <div className="value">{entry.solarKwh} kWh</div>
              </div>
            )}
          </div>
        </div>
      )}

      {entry.notes && (
        <div className="detail-section">
          <div className="detail-section-title">Notities</div>
          <p className="notes-text">{entry.notes}</p>
        </div>
      )}

      <div className="detail-actions">
        <button className="btn btn-danger" onClick={handleDelete}>Verwijderen</button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={onEdit}>Bewerken</button>
      </div>
    </div>
  );
}
