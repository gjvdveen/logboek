import type { FuelEntry } from '../types';
import { formatDate } from '../utils/format';
import InvoiceGallery from './InvoiceGallery';
import { useTranslation } from '../i18n';

interface Props {
  entry: FuelEntry;
  /** Previous entry (sorted by engine hours) for consumption calculation */
  prevEntry: FuelEntry | null;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function FuelDetail({ entry, prevEntry, onEdit, onDelete, onBack }: Props) {
  const { t } = useTranslation();
  const liters = parseFloat(entry.liters) || 0;
  const price  = parseFloat(entry.pricePerLiter) || 0;
  const total  = liters * price;

  let consumption: string | null = null;
  if (prevEntry && liters > 0) {
    const hPrev = parseFloat(prevEntry.engineHours);
    const hCurr = parseFloat(entry.engineHours);
    if (!isNaN(hPrev) && !isNaN(hCurr) && hCurr > hPrev) {
      consumption = (liters / (hCurr - hPrev)).toFixed(2);
    }
  }

  function handleDelete() {
    if (window.confirm(t('fuel.confirm.delete'))) onDelete();
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={onBack}>&larr; {t('btn.back').replace('← ', '')}</button>
        <h2>{t('fuel.detail.title')}</h2>
      </div>

      <div className="detail-route" style={{ background: 'var(--ocean)' }}>
        <div className="route-text">{entry.location || t('fuel.unknown')}</div>
        <div className="route-date">{formatDate(entry.date)}</div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">{t('fuel.detail.fuel')}</div>
        <div className="detail-grid">
          {entry.liters && (
            <div className="detail-item">
              <label>{t('fuel.detail.liters')}</label>
              <div className="value">{entry.liters} {t('fuel.detail.liter')}</div>
            </div>
          )}
          {entry.pricePerLiter && (
            <div className="detail-item">
              <label>{t('fuel.detail.price')}</label>
              <div className="value">&euro; {parseFloat(entry.pricePerLiter).toFixed(3)}</div>
            </div>
          )}
          {total > 0 && (
            <div className="detail-item">
              <label>{t('fuel.detail.cost')}</label>
              <div className="value">&euro; {total.toFixed(2)}</div>
            </div>
          )}
          {entry.engineHours && (
            <div className="detail-item">
              <label>{t('fuel.detail.engine')}</label>
              <div className="value">{entry.engineHours} u</div>
            </div>
          )}
        </div>
      </div>

      {consumption && (
        <div className="detail-section">
          <div className="detail-section-title">{t('fuel.detail.cons')}</div>
          <div className="detail-grid">
            <div className="detail-item">
              <label>{t('fuel.detail.since')}</label>
              <div className="value highlight">{consumption} L/u</div>
            </div>
            {prevEntry && (
              <div className="detail-item">
                <label>{t('fuel.detail.interval')}</label>
                <div className="value">
                  {(parseFloat(entry.engineHours) - parseFloat(prevEntry.engineHours)).toFixed(1)} u
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {entry.notes && (
        <div className="detail-section">
          <div className="detail-section-title">{t('fuel.sec.notes')}</div>
          <p className="notes-text">{entry.notes}</p>
        </div>
      )}

      {entry.invoiceIds?.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">{t('fuel.sec.invoices')}</div>
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
