import { useState } from 'react';
import type { SeizoenStart, SeizoenStartFormData } from '../types';
import { useTranslation } from '../i18n';
import PercentSlider from './PercentSlider';

interface Props {
  entry: SeizoenStart | null;
  onSave: (data: SeizoenStartFormData) => void;
  onCancel: () => void;
}

export default function SeizoenForm({ entry, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const [date,           setDate]           = useState(entry?.date           ?? today);
  const [location,       setLocation]       = useState(entry?.location       ?? '');
  const [engineHours,    setEngineHours]    = useState(entry?.engineHours    ?? '');
  const [batteryPercent, setBatteryPercent] = useState(entry?.batteryPercent ?? '');
  const [waterLevel,     setWaterLevel]     = useState(entry?.waterLevel     ?? '');
  const [notes,          setNotes]          = useState(entry?.notes          ?? '');
  const [error,          setError]          = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) { setError(t('err.required')); return; }
    onSave({ date, location, engineHours, batteryPercent, waterLevel, notes });
  }

  return (
    <form className="form-page" onSubmit={handleSubmit} noValidate>
      <div className="form-page-header">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>&larr; {t('btn.back').replace('← ', '')}</button>
        <h2>{entry ? t('seizoen.edit') : t('seizoen.new')}</h2>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('seizoen.sec.date')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="seizoenDate">{t('seizoen.date')}</label>
            <input id="seizoenDate" type="date" className={`form-control${error ? ' error' : ''}`}
              value={date} onChange={e => { setDate(e.target.value); setError(''); }} />
            {error && <span className="error-msg">{error}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="seizoenLocation">{t('seizoen.location')}</label>
            <input id="seizoenLocation" type="text" className="form-control"
              value={location} onChange={e => setLocation(e.target.value)}
              placeholder={t('seizoen.location.ph')} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('seizoen.sec.engine')}</div>
        <div className="form-group">
          <label htmlFor="seizoenEngineHours">{t('seizoen.engine')}</label>
          <input id="seizoenEngineHours" type="number" step="0.1" min="0" className="form-control"
            value={engineHours} onChange={e => setEngineHours(e.target.value)}
            placeholder={t('seizoen.engine.ph')} />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('seizoen.sec.water')}</div>
        <div className="form-group">
          <label>{t('seizoen.battery')}</label>
          <PercentSlider value={batteryPercent} onChange={setBatteryPercent} />
        </div>
        <div className="form-group">
          <label>{t('seizoen.water')}</label>
          <PercentSlider value={waterLevel} onChange={setWaterLevel} />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('seizoen.sec.notes')}</div>
        <div className="form-group">
          <textarea className="form-control" rows={3}
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder={t('seizoen.notes.ph')} />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('btn.cancel')}</button>
        <button type="submit" className="btn btn-primary">{t('btn.save')}</button>
      </div>
    </form>
  );
}
