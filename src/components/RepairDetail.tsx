import type { RepairEntry } from '../types';
import { formatDate } from '../utils/format';
import InvoiceGallery from './InvoiceGallery';
import { useTranslation } from '../i18n';

interface Props {
  entry: RepairEntry;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function RepairDetail({ entry, onEdit, onDelete, onBack }: Props) {
  const { t } = useTranslation();
  const cost = parseFloat(entry.cost) || 0;

  function handleDelete() {
    if (window.confirm(t('repair.confirm.delete'))) onDelete();
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={onBack}>&larr; {t('btn.back').replace('← ', '')}</button>
        <h2>{t('repair.detail.title')}</h2>
      </div>

      <div className="detail-route repair-banner">
        <div className="route-text">{entry.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${entry.costType === 'jaarlijks' ? 'badge-purple' : 'badge-grey'}`}>
            {t(entry.costType === 'jaarlijks' ? 'repair.costtype.jaarlijks' : 'repair.costtype.eenmalig')}
          </span>
          <div className="route-date">{formatDate(entry.date)}</div>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">{t('repair.detail.cost')}</div>
        <div className="detail-grid">
          {cost > 0 && (
            <div className="detail-item">
              <label>{t('repair.detail.amount')}</label>
              <div className="value">&euro; {cost.toFixed(2)}</div>
            </div>
          )}
          {entry.supplier && (
            <div className="detail-item">
              <label>{t('repair.detail.supp')}</label>
              <div className="value">{entry.supplier}</div>
            </div>
          )}
          {entry.engineHours && (
            <div className="detail-item">
              <label>{t('repair.detail.engine')}</label>
              <div className="value">{entry.engineHours} u</div>
            </div>
          )}
        </div>
      </div>

      {entry.notes && (
        <div className="detail-section">
          <div className="detail-section-title">{t('repair.sec.notes')}</div>
          <p className="notes-text">{entry.notes}</p>
        </div>
      )}

      {entry.invoiceIds?.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">{t('repair.sec.invoices')}</div>
          <InvoiceGallery fileIds={entry.invoiceIds} />
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
