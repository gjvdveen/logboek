import type { RepairEntry } from '../types';
import { formatDate } from '../utils/format';
import { useTranslation } from '../i18n';

interface Props {
  entries: RepairEntry[];
  onView: (id: string) => void;
  onNew: () => void;
}

export default function RepairLog({ entries, onView, onNew }: Props) {
  const { t } = useTranslation();
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const totalCost = entries.reduce((s, e) => s + (parseFloat(e.cost) || 0), 0);

  if (entries.length === 0) {
    return (
      <div className="trip-empty">
        <div className="trip-empty-icon">&#128295;</div>
        <h2>{t('repair.empty.title')}</h2>
        <p>{t('repair.empty.text')}</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={onNew}>
          {t('repair.empty.btn')}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{entries.length}</div>
          <div className="stat-label">{t('repair.stat.count')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">&euro; {totalCost.toFixed(0)}</div>
          <div className="stat-label">{t('repair.stat.cost')}</div>
        </div>
      </div>

      <div className="trip-list">
        {sorted.map(entry => (
          <div
            key={entry.id}
            className="trip-card repair-card"
            onClick={() => onView(entry.id)}
          >
            <div className="trip-card-header">
              <div className="trip-route">{entry.description}</div>
              <div className="trip-date">{formatDate(entry.date)}</div>
            </div>
            <div className="trip-badges">
              <span className={`badge ${entry.costType === 'jaarlijks' ? 'badge-purple' : 'badge-grey'}`}>
                {t(entry.costType === 'jaarlijks' ? 'repair.costtype.jaarlijks' : 'repair.costtype.eenmalig')}
              </span>
              {entry.cost && (
                <span className="badge badge-orange">&euro; {parseFloat(entry.cost).toFixed(2)}</span>
              )}
              {entry.supplier && (
                <span className="badge badge-grey">{entry.supplier}</span>
              )}
              {entry.engineHours && (
                <span className="badge badge-blue">{entry.engineHours} u</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
