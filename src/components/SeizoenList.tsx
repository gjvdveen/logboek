import type { SeizoenStart } from '../types';
import { formatDate } from '../utils/format';
import { useTranslation } from '../i18n';

interface Props {
  seizoenStarts: SeizoenStart[];
  onView: (id: string) => void;
  onNew: () => void;
}

export default function SeizoenList({ seizoenStarts, onView, onNew }: Props) {
  const { t } = useTranslation();
  const sorted = [...seizoenStarts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="settings-section-title">{t('seizoen.section.title')}</div>
      <p className="settings-section-desc">
        {t('seizoen.section.desc')}
      </p>

      {sorted.length === 0 ? (
        <div className="trip-empty">
          <div className="trip-empty-icon">⚓</div>
          <h2>{t('seizoen.empty.title')}</h2>
          <p>{t('seizoen.empty.text')}</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={onNew}>
            {t('seizoen.empty.btn')}
          </button>
        </div>
      ) : (
        <div className="trip-list">
          {sorted.map(s => (
            <div key={s.id} className="trip-card seizoen-card" onClick={() => onView(s.id)}>
              <div className="trip-card-header">
                <div className="trip-route">{t('seizoen.year', new Date(s.date + 'T00:00:00').getFullYear())}</div>
                <div className="trip-date">{formatDate(s.date)}</div>
              </div>
              <div className="trip-badges">
                {s.location && <span className="badge badge-blue">📍 {s.location}</span>}
                {s.engineHours && <span className="badge badge-grey">⚙️ {s.engineHours} u</span>}
                {s.batteryPercent && <span className="badge badge-green">🔋 {s.batteryPercent}%</span>}
                {s.waterLevel && <span className="badge badge-blue">💧 {s.waterLevel}%</span>}
              </div>
            </div>
          ))}
          <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={onNew}>
            {t('seizoen.add.btn')}
          </button>
        </div>
      )}
    </div>
  );
}
