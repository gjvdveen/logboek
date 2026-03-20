import type { CrewMember } from '../types';
import { useTranslation } from '../i18n';

interface Props {
  members: CrewMember[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export default function CrewList({ members, onEdit, onDelete, onNew }: Props) {
  const { t } = useTranslation();
  const vast = members.filter(m => m.type === 'vast');

  function handleDelete(m: CrewMember) {
    if (window.confirm(`${m.name}?`)) onDelete(m.id);
  }

  if (members.length === 0) {
    return (
      <div className="trip-empty">
        <div className="trip-empty-icon">&#128690;</div>
        <h2>{t('crew.empty.title')}</h2>
        <p>{t('crew.empty.text')}</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={onNew}>
          {t('crew.empty.btn')}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{vast.length}</div>
          <div className="stat-label">{t('crew.vast')}</div>
        </div>
      </div>

      <div className="crew-list">
        {vast.map(m => (
          <div key={m.id} className="crew-row">
            <span className="crew-badge crew-badge--vast">{t('crew.tag.vast')}</span>
            <span className="crew-row-name">{m.name}</span>
            <div className="crew-row-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => onEdit(m.id)}>{t('btn.edit')}</button>
              <button className="btn btn-danger  btn-sm" onClick={() => handleDelete(m)}>{t('btn.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
