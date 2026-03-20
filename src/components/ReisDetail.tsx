import type { Reis, Trip } from '../types';
import { formatDate, weatherLabel } from '../utils/format';
import { useTranslation } from '../i18n';

interface Props {
  reis: Reis;
  trips: Trip[];
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onViewTrip: (id: string) => void;
  onAddTrip: () => void;
}

export default function ReisDetail({ reis, trips, onEdit, onDelete, onBack, onViewTrip, onAddTrip }: Props) {
  const { t } = useTranslation();
  const reisTrips = [...trips.filter(trip => trip.reisId === reis.id)]
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate));

  const totalDistance = reisTrips.reduce((s, trip) => s + (parseFloat(trip.distance) || 0), 0);
  const totalMotorH   = reisTrips.reduce((s, trip) => {
    const dep = parseFloat(trip.engineHoursDeparture);
    const arr = parseFloat(trip.engineHoursArrival);
    return (!isNaN(dep) && !isNaN(arr) && arr >= dep) ? s + (arr - dep) : s;
  }, 0);

  const start = reisTrips[0]?.departureDate ?? null;
  const end   = reisTrips[reisTrips.length - 1]?.arrivalDate
             || reisTrips[reisTrips.length - 1]?.departureDate
             || null;

  function handleDelete() {
    if (window.confirm(t('reis.confirm.delete', reis.name))) {
      onDelete();
    }
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={onBack}>&larr; {t('btn.back').replace('← ', '')}</button>
        <h2>{t('reis.detail.title')}</h2>
      </div>

      <div className="detail-route">
        <div className="route-text">{reis.name}</div>
        {start && (
          <div className="route-date">
            {end && end !== start
              ? `${formatDate(start)} – ${formatDate(end)}`
              : formatDate(start)}
          </div>
        )}
      </div>

      {/* Samenvatting */}
      <div className="stats-bar" style={{ margin: '0 0 16px' }}>
        <div className="stat-item">
          <div className="stat-value">{reisTrips.length}</div>
          <div className="stat-label">{t('reis.stat.trips')}</div>
        </div>
        {totalDistance > 0 && (
          <div className="stat-item">
            <div className="stat-value">{totalDistance.toFixed(1)}</div>
            <div className="stat-label">{t('reis.stat.nm')}</div>
          </div>
        )}
        {totalMotorH > 0 && (
          <div className="stat-item">
            <div className="stat-value">{totalMotorH.toFixed(1)}</div>
            <div className="stat-label">{t('reis.stat.engine')}</div>
          </div>
        )}
      </div>

      {/* Notities */}
      {reis.notes && (
        <div className="detail-section">
          <div className="detail-section-title">{t('reis.notes.label')}</div>
          <p className="notes-text">{reis.notes}</p>
        </div>
      )}

      {/* Tochten */}
      <div className="detail-section">
        <div className="detail-section-title" style={{ marginBottom: '10px' }}>
          {t('reis.stat.trips')}
        </div>
        {reisTrips.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
            {t('reis.no_trips')}
          </p>
        ) : (
          <div className="reis-trip-list">
            {reisTrips.map(trip => (
              <div key={trip.id} className="reis-trip-item" onClick={() => onViewTrip(trip.id)}>
                <div className="reis-trip-route">{trip.from} &rarr; {trip.to}</div>
                <div className="reis-trip-meta">
                  <span>{formatDate(trip.departureDate)}</span>
                  {trip.distance && <span>{trip.distance} nm</span>}
                  {trip.windForce && (
                    <span>Bft {trip.windForce}{trip.windDirection ? ` ${trip.windDirection}` : ''}</span>
                  )}
                  {trip.weather && <span>{weatherLabel(trip.weather)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn-secondary" style={{ marginTop: '4px' }} onClick={onAddTrip}>
          {t('reis.add_trip')}
        </button>
      </div>

      <div className="detail-actions">
        <button className="btn btn-danger" onClick={handleDelete}>{t('btn.delete')}</button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={onEdit}>{t('btn.edit')}</button>
      </div>
    </div>
  );
}
