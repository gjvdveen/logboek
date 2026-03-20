import type { SeizoenStart } from '../types';
import { formatDate } from '../utils/format';
import { useTranslation } from '../i18n';

interface Props {
  entry: SeizoenStart;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function SeizoenDetail({ entry, onEdit, onDelete, onBack }: Props) {
  const { t } = useTranslation();

  function handleDelete() {
    if (window.confirm(t('seizoen.confirm.del'))) onDelete();
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={onBack}>&larr; {t('btn.back').replace('← ', '')}</button>
        <h2>{t('seizoen.year', new Date(entry.date + 'T00:00:00').getFullYear())}</h2>
      </div>

      <div className="detail-route">
        <div className="route-text">{entry.location || t('seizoen.section.title')}</div>
        <div className="route-date">{formatDate(entry.date)}</div>
      </div>

      {entry.engineHours && (
        <div className="detail-section">
          <div className="detail-section-title">{t('seizoen.detail.engine')}</div>
          <div className="detail-grid">
            <div className="detail-item">
              <label>{t('seizoen.detail.stand')}</label>
              <div className="value">{entry.engineHours} u</div>
            </div>
          </div>
        </div>
      )}

      {(entry.batteryPercent || entry.waterLevel) && (
        <div className="detail-section">
          <div className="detail-section-title">{t('seizoen.detail.water')}</div>
          <div className="detail-grid">
            {entry.batteryPercent && (
              <div className="detail-item">
                <label>{t('seizoen.detail.bat')}</label>
                <div className="value">{entry.batteryPercent}%</div>
              </div>
            )}
            {entry.waterLevel && (
              <div className="detail-item">
                <label>{t('seizoen.detail.drink')}</label>
                <div className="value">{entry.waterLevel}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      {entry.notes && (
        <div className="detail-section">
          <div className="detail-section-title">{t('seizoen.sec.notes')}</div>
          <p className="notes-text">{entry.notes}</p>
        </div>
      )}

      <div className="detail-actions">
        <button className="btn btn-danger" onClick={handleDelete}>{t('btn.delete')}</button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={onEdit}>{t('btn.edit')}</button>
      </div>
    </div>
  );
}
