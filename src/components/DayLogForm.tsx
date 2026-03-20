import { useState } from 'react';
import PercentSlider from './PercentSlider';
import type { DayLog, DayLogFormData } from '../types';
import DateInput from './DateInput';

interface Props {
  entry: DayLog | null;
  onSave: (data: DayLogFormData) => void;
  onCancel: () => void;
}

const today = new Date().toISOString().split('T')[0];

export default function DayLogForm({ entry, onSave, onCancel }: Props) {
  const [form, setForm] = useState<DayLogFormData>(
    entry
      ? { date: entry.date, location: entry.location, waterLevel: entry.waterLevel,
          waterRefilled: entry.waterRefilled, batteryPercent: entry.batteryPercent,
          solarKwh: entry.solarKwh, notes: entry.notes }
      : { date: today, location: '', waterLevel: '', waterRefilled: false,
          batteryPercent: '', solarKwh: '', notes: '' }
  );
  const [errors, setErrors] = useState<{ date?: string }>({});

  function set<K extends keyof DayLogFormData>(field: K, value: DayLogFormData[K]) {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'date') setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date) { setErrors({ date: 'Verplicht veld' }); return; }
    onSave(form);
  }

  return (
    <form className="form-page" onSubmit={handleSubmit} noValidate>
      <div className="form-page-header">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>&larr; Terug</button>
        <h2>{entry ? 'Dagboek bewerken' : 'Dag aan boord toevoegen'}</h2>
      </div>

      <div className="form-section">
        <div className="form-section-title">Datum &amp; locatie</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="dlDate">Datum *</label>
            <DateInput id="dlDate"
              className={errors.date ? 'error' : ''}
              value={form.date} onChange={v => set('date', v)} />
            {errors.date && <span className="error-msg">{errors.date}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="dlLocation">Locatie / Haven</label>
            <input id="dlLocation" className="form-control"
              value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="bv. Hoorn, thuishaven..." />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Water, accu &amp; energie</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="dlWaterLevel">Drinkwater stand (%)</label>
            <PercentSlider id="dlWaterLevel" value={form.waterLevel} onChange={v => set('waterLevel', v)} />
          </div>
          <div className="form-group form-group--checkbox">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.waterRefilled}
                onChange={e => set('waterRefilled', e.target.checked)} />
              <span>Water bijgevuld</span>
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="dlBattery">Accu stand (%)</label>
            <PercentSlider id="dlBattery" value={form.batteryPercent} onChange={v => set('batteryPercent', v)} />
          </div>
          <div className="form-group">
            <label htmlFor="dlSolar">Zonnepanelen (kWh)</label>
            <input id="dlSolar" type="number" step="0.01" min="0" className="form-control"
              value={form.solarKwh} onChange={e => set('solarKwh', e.target.value)}
              placeholder="0.00" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Notities</div>
        <div className="form-group">
          <textarea className="form-control" value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Opmerkingen van de dag..." rows={4} />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Annuleren</button>
        <button type="submit" className="btn btn-primary">Opslaan</button>
      </div>
    </form>
  );
}
