import { useState } from 'react';
import type { FuelEntry, FuelFormData } from '../types';
import InvoiceUpload from './InvoiceUpload';
import DateInput from './DateInput';
import { useTranslation } from '../i18n';

interface Props {
  entry: FuelEntry | null;
  lastEngineHours: number | null;
  onSave: (data: FuelFormData) => void;
  onCancel: () => void;
}

const today = new Date().toISOString().split('T')[0];

const emptyForm: Omit<FuelFormData, 'invoiceIds'> = {
  date: today, location: '', engineHours: '',
  liters: '', pricePerLiter: '', notes: '',
};

export default function FuelForm({ entry, lastEngineHours, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Omit<FuelFormData, 'invoiceIds'>>(
    entry
      ? { date: entry.date, location: entry.location, engineHours: entry.engineHours,
          liters: entry.liters, pricePerLiter: entry.pricePerLiter, notes: entry.notes }
      : emptyForm
  );
  const [invoiceIds, setInvoiceIds] = useState<string[]>(entry?.invoiceIds ?? []);
  const [errors, setErrors] = useState<Partial<Record<keyof FuelFormData, string>>>({});

  function set(field: keyof Omit<FuelFormData, 'invoiceIds'>, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  const liters = parseFloat(form.liters) || 0;
  const price  = parseFloat(form.pricePerLiter) || 0;
  const total  = liters * price;

  const ehPlaceholder = lastEngineHours !== null ? lastEngineHours.toFixed(1) : '';

  function validate(): boolean {
    const errs: Partial<Record<keyof FuelFormData, string>> = {};
    if (!form.date) errs.date = t('err.required');

    // Only enforce engine-hours minimum when the entry date is today or in the future.
    // For historical entries (date in the past) a lower stand is allowed.
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
        <h2>{entry ? t('fuel.edit') : t('fuel.new')}</h2>
      </div>

      {/* Algemeen */}
      <div className="form-section">
        <div className="form-section-title">{t('fuel.sec.general')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fuelDate">{t('fuel.date')}</label>
            <DateInput id="fuelDate"
              className={errors.date ? 'error' : ''}
              value={form.date} onChange={v => set('date', v)} />
            {errors.date && <span className="error-msg">{errors.date}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="fuelLocation">{t('fuel.location')}</label>
            <input id="fuelLocation" className="form-control"
              value={form.location} onChange={e => set('location', e.target.value)}
              placeholder={t('fuel.location.ph')} />
          </div>
          <div className="form-group">
            <label htmlFor="fuelEngineHours">{t('fuel.engine')}</label>
            {lastEngineHours !== null && (
              <span className="eh-hint-inline">{t('fuel.last', lastEngineHours.toFixed(1))}</span>
            )}
            <input id="fuelEngineHours" type="number" step="0.1" min="0"
              className={`form-control${errors.engineHours ? ' error' : ''}`}
              value={form.engineHours}
              onChange={e => set('engineHours', e.target.value)}
              placeholder={ehPlaceholder} />
            {errors.engineHours && <span className="error-msg">{errors.engineHours}</span>}
          </div>
        </div>
      </div>

      {/* Brandstof */}
      <div className="form-section">
        <div className="form-section-title">{t('fuel.sec.fuel')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fuelLiters">{t('fuel.liters')}</label>
            <input id="fuelLiters" type="number" step="0.01" min="0" className="form-control"
              value={form.liters} onChange={e => set('liters', e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label htmlFor="fuelPrice">{t('fuel.price')}</label>
            <input id="fuelPrice" type="number" step="0.001" min="0" className="form-control"
              value={form.pricePerLiter} onChange={e => set('pricePerLiter', e.target.value)}
              placeholder="0.000" />
          </div>
        </div>
        {total > 0 && (
          <div className="calc-row">
            <span className="calc-label">{t('fuel.total')}</span>
            <span className="calc-value">&euro; {total.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Notities */}
      <div className="form-section">
        <div className="form-section-title">{t('fuel.sec.notes')}</div>
        <div className="form-group">
          <textarea className="form-control" value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder={t('fuel.notes.ph')} rows={3} />
        </div>
      </div>

      {/* Facturen */}
      <div className="form-section">
        <div className="form-section-title">{t('fuel.sec.invoices')}</div>
        <InvoiceUpload fileIds={invoiceIds} onChange={setInvoiceIds} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('btn.cancel')}</button>
        <button type="submit" className="btn btn-primary">{t('btn.save')}</button>
      </div>
    </form>
  );
}
