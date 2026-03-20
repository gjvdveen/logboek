import { useState } from 'react';
import type { Trip, TripFormData, CrewMember, Reis } from '../types';
import InvoiceUpload from './InvoiceUpload';
import PhotoUpload from './PhotoUpload';
import DateInput from './DateInput';
import PortInput from './PortInput';
import WindSlider from './WindSlider';
import WindCompass from './WindCompass';
import VisibilitySlider from './VisibilitySlider';
import WeatherPicker from './WeatherPicker';
import PercentSlider from './PercentSlider';
import { useTranslation } from '../i18n';

interface Props {
  trip: Trip | null;
  lastEngineHours: number | null;
  defaultFrom: string;
  defaultDepartureDate: string;
  recentPorts: string[];
  defaultCrewIds: string[];
  defaultReisId: string;
  crewMembers: CrewMember[];
  reizen: Reis[];
  prevTempCrew: string[];
  onSave: (data: TripFormData) => void;
  onCancel: () => void;
}

export default function TripForm({
  trip, lastEngineHours, defaultFrom, defaultDepartureDate, recentPorts, defaultCrewIds, defaultReisId,
  crewMembers, reizen, prevTempCrew, onSave, onCancel,
}: Props) {
  const { t } = useTranslation();
  const isNew = trip === null;

  const [isDayLog, setIsDayLog] = useState(isNew ? false : (trip.isDayLog ?? false));

  const [form, setForm] = useState(() => ({
    from:                 isNew ? defaultFrom          : trip.from,
    to:                   isNew ? ''                   : trip.to,
    departureDate:        isNew ? defaultDepartureDate : trip.departureDate,
    departureTime:        isNew ? ''                   : trip.departureTime,
    arrivalDate:          isNew ? ''                   : trip.arrivalDate,
    arrivalTime:          isNew ? ''                   : trip.arrivalTime,
    distance:             isNew ? ''                   : trip.distance,
    avgSpeed:             isNew ? ''                   : trip.avgSpeed,
    engineHoursDeparture: isNew ? ''                   : trip.engineHoursDeparture,
    engineHoursArrival:   isNew ? ''                   : trip.engineHoursArrival,
    harborFee:            isNew ? ''                   : trip.harborFee,
    windForce:            isNew ? ''                   : trip.windForce,
    windDirection:        isNew ? ''                   : trip.windDirection,
    visibility:           isNew ? ''                   : trip.visibility,
    weather:              isNew ? ''                   : trip.weather,
    waterLevel:           isNew ? ''                   : trip.waterLevel,
    waterRefilled:        isNew ? false                : trip.waterRefilled,
    batteryPercent:       isNew ? ''                   : trip.batteryPercent,
    solarKwh:             isNew ? ''                   : trip.solarKwh,
    notes:                isNew ? ''                   : trip.notes,
  }));

  const [reisId,        setReisId]        = useState<string>(isNew ? defaultReisId : (trip.reisId ?? ''));
  const [crewIds,       setCrewIds]       = useState<string[]>(isNew ? defaultCrewIds : (trip.crewIds ?? []));
  const [tempCrew,      setTempCrew]      = useState<string[]>(isNew ? [] : (trip.tempCrew ?? []));
  const [tempCrewInput, setTempCrewInput] = useState('');
  const [invoiceIds,    setInvoiceIds]    = useState<string[]>(isNew ? [] : (trip.invoiceIds ?? []));
  const [photoIds,      setPhotoIds]      = useState<string[]>(isNew ? [] : (trip.photoIds ?? []));
  const [errors,        setErrors]        = useState<Partial<Record<keyof TripFormData, string>>>({});

  function set<K extends keyof typeof form>(field: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field as keyof TripFormData]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  function toggleCrew(id: string, checked: boolean) {
    setCrewIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  }

  const ehPlaceholder = lastEngineHours !== null ? lastEngineHours.toFixed(1) : '';

  function addTempCrew() {
    const name = tempCrewInput.trim();
    if (name && !tempCrew.includes(name)) setTempCrew(prev => [...prev, name]);
    setTempCrewInput('');
  }

  function removeTempCrew(name: string) {
    setTempCrew(prev => prev.filter(n => n !== name));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof TripFormData, string>> = {};
    if (!form.from.trim())   errs.from          = t('err.required');
    if (!isDayLog && !form.to.trim())   errs.to = t('err.required');
    if (!form.departureDate) errs.departureDate = t('err.required');
    if (isDayLog && !reisId) errs.reisId        = t('trip.reis.required');

    if (!isDayLog) {
      if (form.engineHoursDeparture && lastEngineHours !== null) {
        const dep = parseFloat(form.engineHoursDeparture);
        if (!isNaN(dep) && dep < lastEngineHours)
          errs.engineHoursDeparture = t('trip.engine.min', lastEngineHours.toFixed(1));
      }
      if (form.engineHoursArrival) {
        const arr    = parseFloat(form.engineHoursArrival);
        const depVal = parseFloat(form.engineHoursDeparture);
        const minVal = !isNaN(depVal) ? depVal : (lastEngineHours ?? 0);
        if (!isNaN(arr) && arr < minVal)
          errs.engineHoursArrival = t('trip.engine.min', minVal.toFixed(1));
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave({ ...form, isDayLog, crewIds, tempCrew, invoiceIds, photoIds, reisId });
  }

  const vastCrew = crewMembers.filter(m => m.type === 'vast');

  return (
    <form className="form-page" onSubmit={handleSubmit} noValidate>
      <div className="form-page-header">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>&larr; {t('btn.back').replace('← ', '')}</button>
        <h2>{isNew ? (isDayLog ? t('trip.ligdag.new') : t('trip.new')) : (isDayLog ? t('trip.ligdag.edit') : t('trip.edit'))}</h2>
      </div>

      {/* Ligdag toggle */}
      <div className="form-section">
        <label className="daylog-toggle">
          <input type="checkbox" checked={isDayLog}
            onChange={e => setIsDayLog(e.target.checked)} />
          <span className="daylog-toggle-text">
            <strong>{t('trip.ligdag.label')}</strong>
            <small>{t('trip.ligdag.hint')}</small>
          </span>
        </label>
      </div>

      {/* Reis */}
      {reizen.length > 0 && (
        <div className="form-section">
          <div className="form-section-title">{t('trip.sec.reis')}</div>
          <div className="form-group">
            <label htmlFor="tripReis">{t('trip.reis.label')}</label>
            <select id="tripReis" className={`form-control${errors.reisId ? ' error' : ''}`}
              value={reisId} onChange={e => {
                const id = e.target.value;
                setReisId(id);
                if (errors.reisId) setErrors(er => ({ ...er, reisId: undefined }));
                if (isNew && id) {
                  const reis = reizen.find(r => r.id === id);
                  if (reis?.crewIds?.length) setCrewIds(reis.crewIds);
                }
              }}>
              <option value="">{isDayLog ? t('trip.reis.none_day') : t('trip.reis.none')}</option>
              {reizen.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            {errors.reisId && <span className="error-msg">{errors.reisId}</span>}
          </div>
        </div>
      )}
      {isDayLog && reizen.length === 0 && (
        <div className="form-section">
          <p className="form-hint" style={{ color: '#c0392b', borderColor: '#e74c3c', background: '#fdf0ed' }}>
            {t('trip.ligdag.no_reis')}
          </p>
        </div>
      )}

      {/* Datum & locatie — always shown */}
      <div className="form-section">
        <div className="form-section-title">{isDayLog ? t('trip.sec.location') : t('trip.sec.route')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="departureDate">{isDayLog ? t('trip.date') : t('trip.dep.date')}</label>
            <DateInput id="departureDate"
              className={errors.departureDate ? 'error' : ''}
              value={form.departureDate} onChange={v => set('departureDate', v)} />
            {errors.departureDate && <span className="error-msg">{errors.departureDate}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="from">{isDayLog ? t('trip.location') : t('trip.from')}</label>
            <PortInput id="from"
              className={errors.from ? 'error' : ''}
              value={form.from} onChange={v => set('from', v)}
              placeholder={isDayLog ? t('trip.from.ph.day') : t('trip.from.ph')}
              suggestions={recentPorts} />
            {errors.from && <span className="error-msg">{errors.from}</span>}
          </div>

          {/* Sailing-only fields */}
          {!isDayLog && (
            <div className="form-group">
              <label htmlFor="to">{t('trip.to')}</label>
              <PortInput id="to"
                className={errors.to ? 'error' : ''}
                value={form.to} onChange={v => set('to', v)}
                placeholder={t('trip.to.ph')} suggestions={recentPorts} />
              {errors.to && <span className="error-msg">{errors.to}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Tijden — sailing only */}
      {!isDayLog && (
        <div className="form-section">
          <div className="form-section-title">{t('trip.sec.times')}</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="departureTime">{t('trip.dep.time')}</label>
              <input id="departureTime" type="time" className="form-control"
                value={form.departureTime} onChange={e => set('departureTime', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="arrivalDate">{t('trip.arr.date')}</label>
              <DateInput id="arrivalDate"
                value={form.arrivalDate} onChange={v => set('arrivalDate', v)} />
            </div>
            <div className="form-group">
              <label htmlFor="arrivalTime">{t('trip.arr.time')}</label>
              <input id="arrivalTime" type="time" className="form-control"
                value={form.arrivalTime} onChange={e => set('arrivalTime', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Afstand & snelheid — sailing only */}
      {!isDayLog && (
        <div className="form-section">
          <div className="form-section-title">{t('trip.sec.dist')}</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="distance">{t('trip.distance')}</label>
              <input id="distance" type="number" step="0.1" min="0" className="form-control"
                value={form.distance} onChange={e => set('distance', e.target.value)} placeholder="0.0" />
            </div>
            <div className="form-group">
              <label htmlFor="avgSpeed">{t('trip.speed')}</label>
              <input id="avgSpeed" type="number" step="0.1" min="0" className="form-control"
                value={form.avgSpeed} onChange={e => set('avgSpeed', e.target.value)} placeholder="0.0" />
            </div>
          </div>
        </div>
      )}

      {/* Motoruren & kosten — sailing only */}
      {!isDayLog && (
        <div className="form-section">
          <div className="form-section-title">{t('trip.sec.engine')}</div>
          {lastEngineHours !== null && (
            <p className="eh-hint">{t('trip.engine.last')}: <strong>{lastEngineHours.toFixed(1)} u</strong></p>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="engineHoursDeparture">{t('trip.engine.dep')}</label>
              <input id="engineHoursDeparture" type="number" step="0.1" min="0"
                className={`form-control${errors.engineHoursDeparture ? ' error' : ''}`}
                value={form.engineHoursDeparture}
                onChange={e => set('engineHoursDeparture', e.target.value)}
                placeholder={ehPlaceholder} />
              {errors.engineHoursDeparture && <span className="error-msg">{errors.engineHoursDeparture}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="engineHoursArrival">{t('trip.engine.arr')}</label>
              <input id="engineHoursArrival" type="number" step="0.1" min="0"
                className={`form-control${errors.engineHoursArrival ? ' error' : ''}`}
                value={form.engineHoursArrival}
                onChange={e => set('engineHoursArrival', e.target.value)}
                placeholder={form.engineHoursDeparture || ehPlaceholder} />
              {errors.engineHoursArrival && <span className="error-msg">{errors.engineHoursArrival}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="harborFee">{t('trip.harborfee')}</label>
              <input id="harborFee" type="number" step="0.01" min="0" className="form-control"
                value={form.harborFee} onChange={e => set('harborFee', e.target.value)} placeholder="0.00" />
            </div>
          </div>
        </div>
      )}

      {/* Weer & wind — sailing only */}
      {!isDayLog && (
        <div className="form-section">
          <div className="form-section-title">{t('trip.sec.weather')}</div>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>{t('trip.wind.force')}</label>
              <WindSlider value={form.windForce} onChange={v => set('windForce', v)} />
            </div>
            <div className="form-group compass-group">
              <label>{t('trip.wind.dir')}</label>
              <WindCompass value={form.windDirection} onChange={v => set('windDirection', v)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>{t('trip.weather')}</label>
              <WeatherPicker value={form.weather} onChange={v => set('weather', v)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>{t('trip.visibility')}</label>
              <VisibilitySlider value={form.visibility} onChange={v => set('visibility', v)} />
            </div>
          </div>
        </div>
      )}

      {/* Water, accu & energie — always shown */}
      <div className="form-section">
        <div className="form-section-title">{t('trip.sec.water')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="waterLevel">{t('trip.water')}</label>
            <PercentSlider id="waterLevel" value={form.waterLevel} onChange={v => set('waterLevel', v)} />
          </div>
          <div className="form-group form-group--checkbox">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.waterRefilled}
                onChange={e => {
                  const checked = e.target.checked;
                  set('waterRefilled', checked);
                  if (checked) set('waterLevel', '100');
                }} />
              <span>{t('trip.water.refilled')}</span>
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="batteryPercent">{t('trip.battery')}</label>
            <PercentSlider id="batteryPercent" value={form.batteryPercent} onChange={v => set('batteryPercent', v)} />
          </div>
          <div className="form-group">
            <label htmlFor="solarKwh">{t('trip.solar')}</label>
            <input id="solarKwh" type="number" step="0.01" min="0" className="form-control"
              value={form.solarKwh} onChange={e => set('solarKwh', e.target.value)} placeholder="0.00" />
          </div>
        </div>
      </div>

      {/* Bemanning — alleen bij dagtocht */}
      {!isDayLog && <div className="form-section">
        <div className="form-section-title">{t('trip.sec.crew')}</div>
        {isNew && reisId && (() => {
          const reis = reizen.find(r => r.id === reisId);
          return reis?.crewIds?.length ? (
            <p className="form-hint form-hint--info">
              {t('trip.crew.from_reis', reis.name)}
            </p>
          ) : null;
        })()}
        {crewMembers.length === 0 ? (
          <p className="form-hint">
            {t('trip.crew.none')}
          </p>
        ) : (
          <div className="crew-select">
            {vastCrew.length > 0 && (
              <div className="crew-select-group">
                <div className="crew-select-group-label">{t('trip.crew.vast')}</div>
                {vastCrew.map(m => (
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
      </div>}

      {/* Tijdelijke bemanning */}
      {!isDayLog && (
        <div className="form-section">
          <div className="form-section-title">{t('trip.sec.tempcrew')}</div>
          <datalist id="tempCrewList">
            {prevTempCrew.map(n => <option key={n} value={n} />)}
          </datalist>
          <div className="temp-crew-input-row">
            <input
              type="text"
              className="form-control"
              list="tempCrewList"
              value={tempCrewInput}
              onChange={e => setTempCrewInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTempCrew(); } }}
              placeholder={t('trip.tempcrew.ph')}
            />
            <button type="button" className="btn btn-secondary" onClick={addTempCrew}>{t('btn.add')}</button>
          </div>
          {tempCrew.length > 0 && (
            <div className="temp-crew-tags">
              {tempCrew.map(name => (
                <span key={name} className="crew-tag crew-tag--tijdelijk">
                  {name}
                  <button type="button" className="temp-crew-remove" onClick={() => removeTempCrew(name)}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notities */}
      <div className="form-section">
        <div className="form-section-title">{t('trip.sec.notes')}</div>
        <div className="form-group">
          <textarea className="form-control" value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder={isDayLog ? t('trip.notes.ph.day') : t('trip.notes.ph')} rows={4} />
        </div>
      </div>

      {/* Foto's */}
      <div className="form-section">
        <div className="form-section-title">{t('trip.sec.photos')}</div>
        <PhotoUpload fileIds={photoIds} onChange={setPhotoIds} />
      </div>

      {/* Facturen */}
      <div className="form-section">
        <div className="form-section-title">{t('trip.sec.invoices')}</div>
        <InvoiceUpload fileIds={invoiceIds} onChange={setInvoiceIds} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('btn.cancel')}</button>
        <button type="submit" className="btn btn-primary">{t('btn.save')}</button>
      </div>
    </form>
  );
}
