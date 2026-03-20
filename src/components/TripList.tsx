import type { Trip, Reis } from '../types';
import { formatDate, weatherIcon, weatherLabel } from '../utils/format';
import { useTranslation } from '../i18n';

interface Props {
  trips: Trip[];
  reizen: Reis[];
  onView: (id: string) => void;
  onNew: () => void;
}

export default function TripList({ trips, reizen, onView, onNew }: Props) {
  const { t } = useTranslation();
  const sorted = [...trips].sort((a, b) => {
    const da = a.departureDate + a.departureTime;
    const db = b.departureDate + b.departureTime;
    return db.localeCompare(da);
  });

  const sailTrips     = trips.filter(trip => !trip.isDayLog);
  const totalDistance = sailTrips.reduce((sum, trip) => sum + (parseFloat(trip.distance) || 0), 0);

  if (trips.length === 0) {
    return (
      <div className="trip-empty">
        <div className="trip-empty-icon">&#9875;</div>
        <h2>{t('trips.empty.title')}</h2>
        <p>{t('trips.empty.text')}</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={onNew}>
          {t('trips.empty.btn')}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{sailTrips.length}</div>
          <div className="stat-label">{t('trips.stat.trips')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalDistance.toFixed(1)}</div>
          <div className="stat-label">{t('trips.stat.nm')}</div>
        </div>
        {trips.length - sailTrips.length > 0 && (
          <div className="stat-item">
            <div className="stat-value">{trips.length - sailTrips.length}</div>
            <div className="stat-label">{t('trips.stat.ligdagen')}</div>
          </div>
        )}
      </div>

      <div className="trip-list">
        {sorted.map(trip => {
          const reisName = trip.reisId ? reizen.find(r => r.id === trip.reisId)?.name : null;
          if (trip.isDayLog) {
            return (
              <div key={trip.id} className="trip-card trip-card--daylog" onClick={() => onView(trip.id)}>
                <div className="trip-card-header">
                  <div className="trip-route trip-route--daylog">
                    <span className="daylog-icon">&#9981;</span> {trip.from || t('trips.aboard')}
                  </div>
                  <div className="trip-date">{formatDate(trip.departureDate)}</div>
                </div>
                <div className="trip-badges">
                  {reisName && <span className="badge badge-reis">{reisName}</span>}
                  {trip.waterRefilled && <span className="badge badge-blue">{t('trips.water.refilled')}</span>}
                  {trip.batteryPercent && <span className="badge badge-green">Accu {trip.batteryPercent}%</span>}
                  {trip.solarKwh && <span className="badge badge-grey">{trip.solarKwh} kWh</span>}
                </div>
              </div>
            );
          }
          return (
            <div key={trip.id} className="trip-card" onClick={() => onView(trip.id)}>
              <div className="trip-card-header">
                <div className="trip-route">{trip.from} &rarr; {trip.to}</div>
                <div className="trip-date">{formatDate(trip.departureDate)}</div>
              </div>
              <div className="trip-badges">
                {trip.distance && <span className="badge badge-blue">{trip.distance} nm</span>}
                {trip.windForce && (
                  <span className="badge badge-green">
                    Bft {trip.windForce}{trip.windDirection ? ` ${trip.windDirection}` : ''}
                  </span>
                )}
                {trip.weather && <span className="badge badge-grey">{weatherIcon(trip.weather)} {weatherLabel(trip.weather)}</span>}
                {reisName && <span className="badge badge-reis">{reisName}</span>}
                {(trip.crewIds?.length ?? 0) > 0 && (
                  <span className="badge badge-crew">{trip.crewIds.length} man</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
