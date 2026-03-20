import type { MaintenanceTask } from '../types';

interface Props {
  tasks: MaintenanceTask[];
  currentEngineHours: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkDone: (id: string) => void;
  onNew: () => void;
}

type Status = 'due' | 'soon' | 'ok';

interface StatusInfo {
  status: Status;
  pct: number;          // 0 = just done, 100 = exactly due, >100 = overdue
  lines: string[];      // one line per interval type
}

function getStatus(task: MaintenanceTask, currentHours: number): StatusInfo {
  const results: StatusInfo[] = [];

  const ih = parseFloat(task.intervalHours);
  if (ih > 0) {
    const last = task.lastDoneHours ? parseFloat(task.lastDoneHours) : 0;
    const done = currentHours - last;
    const pct  = Math.round((done / ih) * 100);
    const rem  = ih - done;
    const status: Status = rem <= 0 ? 'due' : rem <= ih * 0.15 ? 'soon' : 'ok';
    const line = rem <= 0
      ? `${Math.abs(Math.round(rem))} mh te laat`
      : `nog ${Math.round(rem)} mh`;
    results.push({ status, pct: Math.min(110, pct), lines: [line] });
  }

  const id = parseInt(task.intervalDays);
  if (id > 0 && task.lastDoneDate) {
    const last  = new Date(task.lastDoneDate + 'T12:00:00');
    const today = new Date();
    const done  = Math.round((today.getTime() - last.getTime()) / 86_400_000);
    const pct   = Math.round((done / id) * 100);
    const rem   = id - done;
    const status: Status = rem <= 0 ? 'due' : rem <= id * 0.15 ? 'soon' : 'ok';
    const line = rem <= 0
      ? `${Math.abs(rem)} dagen te laat`
      : `nog ${rem} dagen`;
    results.push({ status, pct: Math.min(110, pct), lines: [line] });
  }

  if (results.length === 0) return { status: 'ok', pct: 0, lines: ['Geen interval'] };

  const merged: StatusInfo = {
    status: results.find(r => r.status === 'due')  ? 'due'
          : results.find(r => r.status === 'soon') ? 'soon' : 'ok',
    pct:   Math.max(...results.map(r => r.pct)),
    lines: results.flatMap(r => r.lines),
  };
  return merged;
}

function statusColor(s: Status) {
  return s === 'due' ? '#ef4444' : s === 'soon' ? '#f59e0b' : '#22c55e';
}

const STATUS_LABEL: Record<Status, string> = {
  due:  'Vervallen',
  soon: 'Binnenkort',
  ok:   'In orde',
};

export default function MaintenanceList({ tasks, currentEngineHours, onEdit, onDelete, onMarkDone, onNew }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="maint-empty">
        <div className="maint-empty-icon">🔧</div>
        <h2>Geen onderhoudstaken</h2>
        <p>Voeg onderhoudstaken toe om bij te houden wanneer motor­olie, impeller of andere onderdelen aan vervanging toe zijn.</p>
        <button className="btn btn-primary" onClick={onNew}>+ Taak toevoegen</button>
      </div>
    );
  }

  const withStatus = tasks.map(t => ({ task: t, info: getStatus(t, currentEngineHours) }));
  const ORDER: Status[] = ['due', 'soon', 'ok'];
  withStatus.sort((a, b) => ORDER.indexOf(a.info.status) - ORDER.indexOf(b.info.status));

  const counts = { due: 0, soon: 0, ok: 0 };
  withStatus.forEach(({ info }) => counts[info.status]++);

  return (
    <div className="maint-page">
      {/* Summary bar */}
      <div className="maint-summary">
        {counts.due  > 0 && <span className="maint-summary-chip maint-chip--due">🔴 {counts.due} vervallen</span>}
        {counts.soon > 0 && <span className="maint-summary-chip maint-chip--soon">🟡 {counts.soon} binnenkort</span>}
        {counts.ok   > 0 && <span className="maint-summary-chip maint-chip--ok">🟢 {counts.ok} in orde</span>}
        {currentEngineHours > 0 && (
          <span className="maint-summary-hours">Motorstand: {currentEngineHours.toFixed(0)} mh</span>
        )}
      </div>

      <div className="maint-list">
        {withStatus.map(({ task, info }) => {
          const color = statusColor(info.status);
          const s = info;
          return (
            <div key={task.id} className={`maint-card maint-card--${s.status}`}>
              <div className="maint-card-header">
                <div className="maint-status-dot" style={{ background: color }} />
                <div className="maint-card-title">{task.description}</div>
                <div className="maint-card-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => onMarkDone(task.id)}>✓ Klaar</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task.id)}>✎</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm('Taak verwijderen?')) onDelete(task.id); }}>✕</button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="maint-progress-wrap">
                <div className="maint-progress-track">
                  <div
                    className="maint-progress-fill"
                    style={{ width: `${Math.min(100, s.pct)}%`, background: color }}
                  />
                </div>
                <span className="maint-progress-badge" style={{ color }}>
                  {STATUS_LABEL[s.status]}
                </span>
              </div>

              {/* Detail lines */}
              <div className="maint-card-meta">
                {s.lines.map((l, i) => <span key={i} className="maint-meta-line">{l}</span>)}
                {task.intervalHours && <span className="maint-meta-interval">om {task.intervalHours} mh</span>}
                {task.intervalDays  && <span className="maint-meta-interval">om {task.intervalDays} dagen</span>}
                {task.lastDoneDate  && (
                  <span className="maint-meta-last">
                    Laatste: {task.lastDoneDate.split('-').reverse().join('-')}
                    {task.lastDoneHours ? ` @ ${task.lastDoneHours} mh` : ''}
                  </span>
                )}
              </div>

              {task.notes && <div className="maint-card-notes">{task.notes}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
