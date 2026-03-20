import { useState } from 'react';
import type { MaintenanceTask, MaintenanceFormData } from '../types';

interface Props {
  task: MaintenanceTask | null;
  currentEngineHours: number;
  onSave: (data: MaintenanceFormData) => void;
  onCancel: () => void;
}

const today = new Date().toISOString().split('T')[0];

export default function MaintenanceForm({ task, currentEngineHours, onSave, onCancel }: Props) {
  const isNew = !task;
  const [description,   setDescription]   = useState(task?.description   ?? '');
  const [intervalHours, setIntervalHours] = useState(task?.intervalHours ?? '');
  const [intervalDays,  setIntervalDays]  = useState(task?.intervalDays  ?? '');
  const [lastDoneHours, setLastDoneHours] = useState(task?.lastDoneHours ?? '');
  const [lastDoneDate,  setLastDoneDate]  = useState(task?.lastDoneDate  ?? today);
  const [notes,         setNotes]         = useState(task?.notes         ?? '');
  const [error,         setError]         = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) { setError('Omschrijving is verplicht'); return; }
    if (!intervalHours && !intervalDays) { setError('Stel minimaal één interval in (motoruren of dagen)'); return; }
    onSave({ description: description.trim(), intervalHours, intervalDays, lastDoneHours, lastDoneDate, notes });
  }

  return (
    <form className="form-page" onSubmit={handleSubmit} noValidate>
      <div className="form-page-header">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>&larr; Terug</button>
        <h2>{isNew ? 'Onderhoudstaak toevoegen' : 'Onderhoudstaak bewerken'}</h2>
      </div>

      <div className="form-section">
        <div className="form-section-title">Taak</div>
        <div className="form-group">
          <label htmlFor="maintDesc">Omschrijving *</label>
          <input id="maintDesc" type="text" className={`form-control${error && !description ? ' error' : ''}`}
            value={description} onChange={e => { setDescription(e.target.value); setError(''); }}
            placeholder="bv. Motorolie + filter verversen" />
        </div>
        <div className="form-group">
          <label htmlFor="maintNotes">Notities</label>
          <textarea id="maintNotes" className="form-control" rows={2}
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Merk, type, aanwijzingen..." />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Interval</div>
        <p className="form-hint">Stel motoruren, kalenderdagen of beide in. De app waarschuwt wanneer het tijd is.</p>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="maintIH">Elke … motoruren</label>
            <input id="maintIH" type="number" min="1" step="1" className="form-control"
              value={intervalHours} onChange={e => { setIntervalHours(e.target.value); setError(''); }}
              placeholder="bv. 250" />
          </div>
          <div className="form-group">
            <label htmlFor="maintID">Elke … dagen</label>
            <input id="maintID" type="number" min="1" step="1" className="form-control"
              value={intervalDays} onChange={e => { setIntervalDays(e.target.value); setError(''); }}
              placeholder="bv. 365" />
          </div>
        </div>
        {error && <span className="error-msg">{error}</span>}
      </div>

      <div className="form-section">
        <div className="form-section-title">Laatste uitvoering</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="maintDate">Datum</label>
            <input id="maintDate" type="date" className="form-control"
              value={lastDoneDate} onChange={e => setLastDoneDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="maintLH">
              Motorstand (mh)
              {currentEngineHours > 0 && (
                <button type="button" className="btn-inline-hint"
                  onClick={() => setLastDoneHours(String(Math.round(currentEngineHours)))}>
                  gebruik huidige ({Math.round(currentEngineHours)} mh)
                </button>
              )}
            </label>
            <input id="maintLH" type="number" min="0" step="0.1" className="form-control"
              value={lastDoneHours} onChange={e => setLastDoneHours(e.target.value)}
              placeholder="bv. 1248" />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Annuleren</button>
        <button type="submit" className="btn btn-primary">Opslaan</button>
      </div>
    </form>
  );
}
