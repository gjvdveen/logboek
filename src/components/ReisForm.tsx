import { useState } from 'react';
import type { Reis, ReisFormData, CrewMember } from '../types';
import { useTranslation } from '../i18n';

interface Props {
  reis: Reis | null;
  crewMembers: CrewMember[];
  onSave: (data: ReisFormData) => void;
  onCancel: () => void;
}

export default function ReisForm({ reis, crewMembers, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const [name,      setName]      = useState(reis?.name      ?? '');
  const [startDate, setStartDate] = useState(reis?.startDate ?? '');
  const [endDate,   setEndDate]   = useState(reis?.endDate   ?? '');
  const [notes,     setNotes]     = useState(reis?.notes     ?? '');
  const [crewIds,   setCrewIds]   = useState<string[]>(reis?.crewIds ?? []);
  const [error,     setError]     = useState('');

  function toggleCrew(id: string, checked: boolean) {
    setCrewIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError(t('err.required')); return; }
    onSave({ name: name.trim(), startDate, endDate, notes, crewIds });
  }

  const vastCrew      = crewMembers.filter(m => m.type === 'vast');
  const tijdelijkCrew = crewMembers.filter(m => m.type === 'tijdelijk');

  return (
    <form className="form-page" onSubmit={handleSubmit} noValidate>
      <div className="form-page-header">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>&larr; {t('btn.back').replace('← ', '')}</button>
        <h2>{reis ? t('reis.edit') : t('reis.new')}</h2>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('reis.sec.general')}</div>
        <div className="form-group">
          <label htmlFor="reisName">{t('reis.name')}</label>
          <input
            id="reisName"
            className={`form-control${error ? ' error' : ''}`}
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder={t('reis.name.ph')}
          />
          {error && <span className="error-msg">{error}</span>}
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="reisStart">{t('reis.from')}</label>
            <input id="reisStart" type="date" className="form-control"
              value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="reisEnd">{t('reis.to')}</label>
            <input id="reisEnd" type="date" className="form-control"
              value={endDate} min={startDate || undefined}
              onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="reisNotes">{t('reis.notes')}</label>
          <textarea
            id="reisNotes"
            className="form-control"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('reis.notes.ph')}
            rows={3}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('reis.sec.crew')}</div>
        {crewMembers.length === 0 ? (
          <p className="form-hint">
            {t('reis.crew.none')}
          </p>
        ) : (
          <div className="crew-select">
            {vastCrew.length > 0 && (
              <div className="crew-select-group">
                <div className="crew-select-group-label">{t('reis.crew.vast')}</div>
                {vastCrew.map(m => (
                  <label key={m.id} className="crew-checkbox">
                    <input type="checkbox" checked={crewIds.includes(m.id)}
                      onChange={e => toggleCrew(m.id, e.target.checked)} />
                    <span>{m.name}</span>
                  </label>
                ))}
              </div>
            )}
            {tijdelijkCrew.length > 0 && (
              <div className="crew-select-group">
                <div className="crew-select-group-label">{t('trip.sec.tempcrew')}</div>
                {tijdelijkCrew.map(m => (
                  <label key={m.id} className="crew-checkbox">
                    <input type="checkbox" checked={crewIds.includes(m.id)}
                      onChange={e => toggleCrew(m.id, e.target.checked)} />
                    <span>{m.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        <p className="form-hint" style={{ marginTop: 8 }}>
          {t('reis.crew.hint')}
        </p>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('btn.cancel')}</button>
        <button type="submit" className="btn btn-primary">{t('btn.save')}</button>
      </div>
    </form>
  );
}
