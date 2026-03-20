import { useState } from 'react';
import type { CrewMember, CrewFormData } from '../types';
import { useTranslation } from '../i18n';

interface Props {
  member: CrewMember | null;
  onSave: (data: CrewFormData) => void;
  onCancel: () => void;
}

const emptyForm: CrewFormData = { name: '', type: 'vast' };

export default function CrewForm({ member, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<CrewFormData>(
    member ? { name: member.name, type: member.type } : emptyForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof CrewFormData, string>>>({});

  function set<K extends keyof CrewFormData>(field: K, value: CrewFormData[K]) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<keyof CrewFormData, string>> = {};
    if (!form.name.trim()) errs.name = t('err.required');
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave(form);
  }

  return (
    <form className="form-page" onSubmit={handleSubmit} noValidate>
      <div className="form-page-header">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>&larr; {t('btn.back').replace('← ', '')}</button>
        <h2>{member ? t('crew.edit') : t('crew.new')}</h2>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('crew.sec.data')}</div>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="crewName">{t('crew.name')}</label>
            <input
              id="crewName"
              className={`form-control${errors.name ? ' error' : ''}`}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder={t('crew.name.ph')}
              autoFocus
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('btn.cancel')}</button>
        <button type="submit" className="btn btn-primary">{t('btn.save')}</button>
      </div>
    </form>
  );
}
