import { useState } from 'react';
import type { RepairEntry, RepairFormData } from '../types';
import InvoiceUpload from './InvoiceUpload';
import DateInput from './DateInput';
import PortInput from './PortInput';
import { useTranslation } from '../i18n';

interface Props {
  entry: RepairEntry | null;
  lastEngineHours: number | null;
  suppliers: string[];
  onSave: (data: RepairFormData) => void;
  onCancel: () => void;
}

const today = new Date().toISOString().split('T')[0];

const emptyForm: Omit<RepairFormData, 'invoiceIds'> = {
  date: today, description: '', cost: '', costType: 'eenmalig',
  supplier: '', engineHours: '', notes: '',
};

export default function RepairForm({ entry, lastEngineHours, suppliers, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Omit<RepairFormData, 'invoiceIds'>>(
    entry
      ? { date: entry.date, description: entry.description, cost: entry.cost,
          costType: entry.costType ?? 'eenmalig',
          supplier: entry.supplier, engineHours: entry.engineHours, notes: entry.notes }
      : emptyForm
  );
  const [invoiceIds, setInvoiceIds] = useState<string[]>(entry?.invoiceIds ?? []);
  const [errors, setErrors] = useState<Partial<Record<keyof RepairFormData, string>>>({});

  function set(field: keyof Omit<RepairFormData, 'invoiceIds'>, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  const ehPlaceholder = lastEngineHours !== null ? lastEngineHours.toFixed(1) : '';

  function validate(): boolean {
    const errs: Partial<Record<keyof RepairFormData, string>> = {};
    if (!form.date)               errs.date        = t('err.required');
    if (!form.description.trim()) errs.description = t('err.required');

    // Only enforce engine-hours minimum for today/future entries; allow lower for historical dates.
    if (form.engineHours && lastEngineHours !== null && form.date >= today) {
      const h = parseFloat(form.engineHours);
      if (!isNaN(h) && h < lastEngineHours)
        errs.engineHours = t('trip.engine.min', lastEngineHours.toFixed(1));
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave({ ...form, invoiceIds });
  }

  return (
    <form className="form-page" onSubmit={handleSubmit} noValidate>
      <div className="form-page-header">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>&larr; {t('btn.back').replace('← ', '')}</button>
        <h2>{entry ? t('repair.edit') : t('repair.new')}</h2>
      </div>

      {/* Algemeen */}
      <div className="form-section">
        <div className="form-section-title">{t('repair.sec.general')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="repairDate">{t('repair.date')}</label>
            <DateInput id="repairDate"
              className={errors.date ? 'error' : ''}
              value={form.date} onChange={v => set('date', v)} />
            {errors.date && <span className="error-msg">{errors.date}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="repairEngineHours">{t('repair.engine')}</label>
            {lastEngineHours !== null && (
              <span className="eh-hint-inline">{t('fuel.last', lastEngineHours.toFixed(1))}</span>
            )}
            <input id="repairEngineHours" type="number" step="0.1" min="0"
              className={`form-control${errors.engineHours ? ' error' : ''}`}
              value={form.engineHours}
              onChange={e => set('engineHours', e.target.value)}
              placeholder={ehPlaceholder} />
            {errors.engineHours && <span className="error-msg">{errors.engineHours}</span>}
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="repairDescription">{t('repair.desc')}</label>
            <input id="repairDescription"
              className={`form-control${errors.description ? ' error' : ''}`}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder={t('repair.desc.ph')} />
            {errors.description && <span className="error-msg">{errors.description}</span>}
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>{t('repair.costtype')}</label>
            <div className="costtype-toggle">
              <button type="button"
                className={`costtype-btn${form.costType === 'eenmalig' ? ' active' : ''}`}
                onClick={() => set('costType', 'eenmalig')}>
                {t('repair.costtype.eenmalig')}
              </button>
              <button type="button"
                className={`costtype-btn${form.costType === 'jaarlijks' ? ' active' : ''}`}
                onClick={() => set('costType', 'jaarlijks')}>
                {t('repair.costtype.jaarlijks')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kosten & uitvoerder */}
      <div className="form-section">
        <div className="form-section-title">{t('repair.sec.cost')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="repairCost">{t('repair.cost')}</label>
            <input id="repairCost" type="number" step="0.01" min="0" className="form-control"
              value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label htmlFor="repairSupplier">{t('repair.supplier')}</label>
            <PortInput id="repairSupplier"
              value={form.supplier} onChange={v => set('supplier', v)}
              placeholder={t('repair.supplier.ph')}
              suggestions={suppliers} />
          </div>
        </div>
      </div>

      {/* Notities */}
      <div className="form-section">
        <div className="form-section-title">{t('repair.sec.notes')}</div>
        <div className="form-group">
          <textarea className="form-control" value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder={t('repair.notes.ph')} rows={4} />
        </div>
      </div>

      {/* Facturen */}
      <div className="form-section">
        <div className="form-section-title">{t('repair.sec.invoices')}</div>
        <InvoiceUpload fileIds={invoiceIds} onChange={setInvoiceIds} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('btn.cancel')}</button>
        <button type="submit" className="btn btn-primary">{t('btn.save')}</button>
      </div>
    </form>
  );
}
