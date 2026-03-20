import { useState, useEffect, useRef } from 'react';
import type { BootData } from '../types';
import { useTranslation } from '../i18n';
import { addFile, getFileBlob, removeFile } from '../utils/fileStore';

interface Props {
  data: BootData;
  onSave: (data: BootData) => void;
}

export default function BootForm({ data, onSave }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<BootData>({ ...data });
  const [saved, setSaved] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (form.bannerImageId) {
      getFileBlob(form.bannerImageId).then(blob => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onload = () => setBannerUrl(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } else {
      setBannerUrl('');
    }
  }, [form.bannerImageId]);

  function set(field: keyof BootData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Verwijder oude banner
    if (form.bannerImageId) await removeFile(form.bannerImageId);
    const meta = await addFile(file);
    setForm(f => ({ ...f, bannerImageId: meta.id }));
    setSaved(false);
    // Reset input zodat dezelfde foto opnieuw gekozen kan worden
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleBannerRemove() {
    if (form.bannerImageId) await removeFile(form.bannerImageId);
    setForm(f => ({ ...f, bannerImageId: '' }));
    setBannerUrl('');
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
    setSaved(true);
  }

  return (
    <form className="form-page" onSubmit={handleSubmit} noValidate>
      <div className="form-page-header">
        <h2>{t('boot.title')}</h2>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('boot.sec.general')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="bootNaam">{t('boot.naam')}</label>
            <input id="bootNaam" type="text" className="form-control"
              value={form.naam} onChange={e => set('naam', e.target.value)}
              placeholder={t('boot.naam.ph')} />
          </div>
          <div className="form-group">
            <label htmlFor="bootType">{t('boot.type')}</label>
            <input id="bootType" type="text" className="form-control"
              value={form.type} onChange={e => set('type', e.target.value)}
              placeholder={t('boot.type.ph')} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="bootLigplaats">{t('boot.ligplaats')}</label>
            <input id="bootLigplaats" type="text" className="form-control"
              value={form.ligplaats} onChange={e => set('ligplaats', e.target.value)}
              placeholder={t('boot.ligplaats.ph')} />
          </div>
          <div className="form-group">
            <label htmlFor="bootBoxnr">{t('boot.boxnr')}</label>
            <input id="bootBoxnr" type="text" className="form-control"
              value={form.boxnr} onChange={e => set('boxnr', e.target.value)}
              placeholder={t('boot.boxnr.ph')} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('boot.sec.dims')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="bootLengte">{t('boot.lengte')}</label>
            <input id="bootLengte" type="number" step="0.01" min="0" className="form-control"
              value={form.lengte} onChange={e => set('lengte', e.target.value)}
              placeholder={t('boot.lengte.ph')} />
          </div>
          <div className="form-group">
            <label htmlFor="bootBreedte">{t('boot.breedte')}</label>
            <input id="bootBreedte" type="number" step="0.01" min="0" className="form-control"
              value={form.breedte} onChange={e => set('breedte', e.target.value)}
              placeholder={t('boot.breedte.ph')} />
          </div>
          <div className="form-group">
            <label htmlFor="bootDiepgang">{t('boot.diepgang')}</label>
            <input id="bootDiepgang" type="number" step="0.01" min="0" className="form-control"
              value={form.diepgang} onChange={e => set('diepgang', e.target.value)}
              placeholder={t('boot.diepgang.ph')} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('boot.sec.cap')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="bootTankWater">{t('boot.tankwater')}</label>
            <input id="bootTankWater" type="number" step="1" min="0" className="form-control"
              value={form.tankWater} onChange={e => set('tankWater', e.target.value)}
              placeholder={t('boot.tankwater.ph')} />
          </div>
          <div className="form-group">
            <label htmlFor="bootTankBrandstof">{t('boot.tankfuel')}</label>
            <input id="bootTankBrandstof" type="number" step="1" min="0" className="form-control"
              value={form.tankBrandstof} onChange={e => set('tankBrandstof', e.target.value)}
              placeholder={t('boot.tankfuel.ph')} />
          </div>
          <div className="form-group">
            <label htmlFor="bootMaxAccu">{t('boot.accu')}</label>
            <input id="bootMaxAccu" type="number" step="1" min="0" className="form-control"
              value={form.maxAccu} onChange={e => set('maxAccu', e.target.value)}
              placeholder={t('boot.accu.ph')} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">{t('boot.banner')}</div>
        <div className="banner-upload-area">
          {bannerUrl ? (
            <div className="banner-preview-wrap">
              <img src={bannerUrl} alt="banner" className="banner-preview" />
              <div className="banner-preview-actions">
                <button type="button" className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}>
                  {t('boot.banner.change')}
                </button>
                <button type="button" className="btn btn-danger btn-sm"
                  onClick={handleBannerRemove}>
                  {t('boot.banner.remove')}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="banner-upload-placeholder"
              onClick={() => fileInputRef.current?.click()}>
              <span className="banner-upload-icon">🖼️</span>
              <span>{t('boot.banner.ph')}</span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={handleBannerUpload} />
        </div>
      </div>

      <div className="form-actions">
        {saved && <span className="save-confirm">{t('boot.saved')}</span>}
        <div style={{ flex: 1 }} />
        <button type="submit" className="btn btn-primary">{t('btn.save')}</button>
      </div>
    </form>
  );
}
