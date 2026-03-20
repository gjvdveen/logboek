import type { Trip, CrewMember } from '../types';
import { VISIBILITY_OPTIONS } from '../types';
import { formatDate, formatDateTime, weatherLabel, weatherIcon, beaufortLabel, computeDuration } from '../utils/format';
import InvoiceGallery from './InvoiceGallery';
import PhotoGallery from './PhotoGallery';
import { useTranslation } from '../i18n';

interface Props {
  trip: Trip;
  crewMembers: CrewMember[];
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function TripDetail({ trip, crewMembers, onEdit, onDelete, onBack }: Props) {
  const { t } = useTranslation();
  const isDayLog = trip.isDayLog ?? false;

  const duration = computeDuration(
    trip.departureDate, trip.departureTime,
    trip.arrivalDate,   trip.arrivalTime,
  );
  const visLabel = VISIBILITY_OPTIONS.find(o => o.value === trip.visibility)?.label ?? trip.visibility;

  const engineHoursUsed =
    trip.engineHoursDeparture && trip.engineHoursArrival
      ? (parseFloat(trip.engineHoursArrival) - parseFloat(trip.engineHoursDeparture)).toFixed(1)
      : null;

  function handleDelete() {
    const label = isDayLog
      ? t('trip.confirm.delete', trip.from || formatDate(trip.departureDate))
      : t('trip.confirm.delete2', trip.from, trip.to);
    if (window.confirm(label)) onDelete();
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={onBack}>&larr; {t('btn.back').replace('← ', '')}</button>
        <h2>{isDayLog ? t('trip.ligdag.title') : t('trip.detail.title')}</h2>
      </div>

      <div className="detail-route">
        {isDayLog
          ? <div className="route-text">{trip.from || t('trip.aboard')}</div>
          : <div className="route-text">{trip.from} &rarr; {trip.to}</div>
        }
        <div className="route-date">{formatDate(trip.departureDate)}</div>
      </div>

      {/* Tijden — sailing only */}
      {!isDayLog && (
        <div className="detail-section">
          <div className="detail-section-title">{t('trip.sec.times')}</div>
          <div className="detail-grid">
            <div className="detail-item">
              <label>{t('trip.dep')}</label>
              <div className="value">{formatDateTime(trip.departureDate, trip.departureTime)}</div>
            </div>
            {(trip.arrivalDate || trip.arrivalTime) && (
              <div className="detail-item">
                <label>{t('trip.arr')}</label>
                <div className="value">{formatDateTime(trip.arrivalDate, trip.arrivalTime)}</div>
              </div>
            )}
            {duration && (
              <div className="detail-item">
                <label>{t('trip.duration')}</label>
                <div className="value">{duration}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Afstand & snelheid — sailing only */}
      {!isDayLog && (trip.distance || trip.avgSpeed) && (
        <div className="detail-section">
          <div className="detail-section-title">{t('trip.sec.dist')}</div>
          <div className="detail-grid">
            {trip.distance && (
              <div className="detail-item">
                <label>{t('trip.dist.label')}</label>
                <div className="value">{trip.distance} nm</div>
              </div>
            )}
            {trip.avgSpeed && (
              <div className="detail-item">
                <label>{t('trip.speed.label')}</label>
                <div className="value">{trip.avgSpeed} kn</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Motoruren & kosten — sailing only */}
      {!isDayLog && (trip.engineHoursDeparture || trip.engineHoursArrival || trip.harborFee) && (
        <div className="detail-section">
          <div className="detail-section-title">{t('trip.sec.engine')}</div>
          <div className="detail-grid">
            {trip.engineHoursDeparture && (
              <div className="detail-item">
                <label>{t('trip.engine.dep')}</label>
                <div className="value">{trip.engineHoursDeparture} u</div>
              </div>
            )}
            {trip.engineHoursArrival && (
              <div className="detail-item">
                <label>{t('trip.engine.arr')}</label>
                <div className="value">{trip.engineHoursArrival} u</div>
              </div>
            )}
            {engineHoursUsed !== null && (
              <div className="detail-item">
                <label>{t('trip.engine.used')}</label>
                <div className="value">{engineHoursUsed} u</div>
              </div>
            )}
            {trip.harborFee && (
              <div className="detail-item">
                <label>{t('trip.harborfee')}</label>
                <div className="value">&euro; {parseFloat(trip.harborFee).toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weer & wind — sailing only */}
      {!isDayLog && (trip.windForce || trip.windDirection || trip.weather || trip.visibility) && (
        <div className="detail-section">
          <div className="detail-section-title">{t('trip.sec.weather')}</div>
          <div className="detail-grid">
            {trip.windForce && (
              <div className="detail-item">
                <label>{t('trip.wind.force')}</label>
                <div className="value">Bft {trip.windForce} &mdash; {beaufortLabel(trip.windForce)}</div>
              </div>
            )}
            {trip.windDirection && (
              <div className="detail-item">
                <label>{t('trip.wind.dir')}</label>
                <div className="value">{trip.windDirection}</div>
              </div>
            )}
            {trip.weather && (
              <div className="detail-item">
                <label>{t('trip.weather')}</label>
                <div className="value">
                  <span className="weather-icon-sm">{weatherIcon(trip.weather)}</span>
                  {' '}{weatherLabel(trip.weather)}
                </div>
              </div>
            )}
            {trip.visibility && (
              <div className="detail-item">
                <label>{t('trip.visibility')}</label>
                <div className="value">{visLabel}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Water, accu & energie */}
      {(trip.waterLevel || trip.waterRefilled || trip.batteryPercent || trip.solarKwh) && (
        <div className="detail-section">
          <div className="detail-section-title">{t('trip.sec.water')}</div>
          <div className="detail-grid">
            {trip.waterLevel && (
              <div className="detail-item">
                <label>{t('trip.water')}</label>
                <div className="value">{trip.waterLevel}%</div>
              </div>
            )}
            {trip.waterRefilled && (
              <div className="detail-item">
                <label>{t('trip.water.refilled')}</label>
                <div className="value">{t('trip.water.yes')}</div>
              </div>
            )}
            {trip.batteryPercent && (
              <div className="detail-item">
                <label>{t('trip.battery')}</label>
                <div className="value">{trip.batteryPercent}%</div>
              </div>
            )}
            {trip.solarKwh && (
              <div className="detail-item">
                <label>{t('trip.solar')}</label>
                <div className="value">{trip.solarKwh} kWh</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bemanning */}
      {((trip.crewIds?.length ?? 0) > 0 || (trip.tempCrew?.length ?? 0) > 0) && (
        <div className="detail-section">
          <div className="detail-section-title">{t('trip.sec.crew')}</div>
          <div className="crew-tags">
            {trip.crewIds.map(id => {
              const m = crewMembers.find(c => c.id === id);
              return m ? (
                <span key={id} className="crew-tag crew-tag--vast">{m.name}</span>
              ) : null;
            })}
            {(trip.tempCrew ?? []).map(name => (
              <span key={name} className="crew-tag crew-tag--tijdelijk">{name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Notities */}
      {trip.notes && (
        <div className="detail-section">
          <div className="detail-section-title">{t('trip.sec.notes')}</div>
          <p className="notes-text">{trip.notes}</p>
        </div>
      )}

      {/* Foto's */}
      {(trip.photoIds?.length ?? 0) > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">{t('trip.sec.photos')}</div>
          <PhotoGallery fileIds={trip.photoIds} />
        </div>
      )}

      {/* Facturen */}
      {trip.invoiceIds?.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">{t('trip.sec.invoices')}</div>
          <InvoiceGallery fileIds={trip.invoiceIds} />
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
