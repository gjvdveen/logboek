import type { Reis, Trip } from '../types';
import { formatDate } from '../utils/format';
import { useTranslation } from '../i18n';

interface Props {
  reizen: Reis[];
  trips: Trip[];
  onView: (id: string) => void;
  onViewTrip: (id: string) => void;
  onNew: () => void;
}

function reisStats(reis: Reis, trips: Trip[]) {
  const t = trips.filter(tr => tr.reisId === reis.id && !tr.isDayLog)
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate));
  const all = trips.filter(tr => tr.reisId === reis.id)
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate));

  const distance = t.reduce((s, tr) => s + (parseFloat(tr.distance) || 0), 0);

  // Vaaruren: som van motoruren per tocht, anders via tijden
  let totalMinutes = 0;
  for (const tr of t) {
    const dep = parseFloat(tr.engineHoursDeparture);
    const arr = parseFloat(tr.engineHoursArrival);
    if (!isNaN(dep) && !isNaN(arr) && arr > dep) {
      totalMinutes += (arr - dep) * 60;
    } else if (tr.departureDate && tr.departureTime && tr.arrivalDate && tr.arrivalTime) {
      const d = new Date(`${tr.departureDate}T${tr.departureTime}`);
      const a = new Date(`${tr.arrivalDate}T${tr.arrivalTime}`);
      const diff = a.getTime() - d.getTime();
      if (diff > 0) totalMinutes += diff / 60_000;
    }
  }
  const vaarUren = totalMinutes > 0
    ? totalMinutes < 60
      ? `${Math.round(totalMinutes)} min`
      : `${Math.floor(totalMinutes / 60)}u ${Math.round(totalMinutes % 60)}min`
    : null;

  const start = all[0]?.departureDate || reis.startDate || null;
  const end   = all[all.length - 1]?.arrivalDate || all[all.length - 1]?.departureDate || reis.endDate || null;
  return { tripCount: t.length, distance, vaarUren, start, end };
}

export default function ReisList({ reizen, trips, onView, onViewTrip, onNew }: Props) {
  const { t } = useTranslation();
  const sorted = [...reizen].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Also show trips not belonging to any reis
  const losseTrips = [...trips]
    .filter(trip => !trip.reisId)
    .sort((a, b) => (b.departureDate + b.departureTime).localeCompare(a.departureDate + a.departureTime));

  if (reizen.length === 0 && losseTrips.length === 0 && trips.length === 0) {
    return (
      <div className="trip-empty">
        <div className="trip-empty-icon">&#127758;</div>
        <h2>{t('reizen.empty.title')}</h2>
        <p>{t('reizen.empty.text')}</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={onNew}>
          {t('reizen.empty.btn')}
        </button>
      </div>
    );
  }

  return (
    <div className="reis-list">
      {sorted.map(reis => {
        const { tripCount, distance, vaarUren, start, end } = reisStats(reis, trips);
        const dateRange = start
          ? end && end !== start
            ? `${formatDate(start)} – ${formatDate(end)}`
            : formatDate(start)
          : null;
        return (
          <div key={reis.id} className="reis-card" onClick={() => onView(reis.id)}>
            <div className="reis-card-header">
              <div className="reis-name">{reis.name}</div>
              {dateRange && <div className="reis-dates">{dateRange}</div>}
            </div>
            <div className="reis-stats">
              <span className="reis-stat">{tripCount} {tripCount === 1 ? t('reizen.trip') : t('reizen.trips')}</span>
              {distance > 0 && <span className="reis-stat">{distance.toFixed(1)} nm</span>}
              {vaarUren && <span className="reis-stat">⏱ {vaarUren}</span>}
            </div>
            {reis.notes && <p className="reis-notes">{reis.notes}</p>}
          </div>
        );
      })}

      {losseTrips.length > 0 && (
        <>
          {reizen.length > 0 && (
            <div className="reis-section-label">{t('reizen.loose')}</div>
          )}
          {losseTrips.map(trip => (
            <div key={trip.id} className="trip-card trip-card--loose"
              onClick={() => onViewTrip(trip.id)}>
              <div className="trip-card-header">
                <div className="trip-route">{trip.from} &rarr; {trip.to}</div>
                <div className="trip-date">{formatDate(trip.departureDate)}</div>
              </div>
              {trip.distance && (
                <div className="trip-badges">
                  <span className="badge badge-blue">{trip.distance} nm</span>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
