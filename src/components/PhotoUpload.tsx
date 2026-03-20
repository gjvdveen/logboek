import { useState, useEffect, useRef } from 'react';
import { addFile, getFileMeta, getFileBlob, removeFile, type StoredFileMeta } from '../utils/fileStore';

interface Props {
  fileIds: string[];
  onChange: (ids: string[]) => void;
}

export default function PhotoUpload({ fileIds, onChange }: Props) {
  const [metas,    setMetas]    = useState<StoredFileMeta[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fileIds.length === 0) return;
    Promise.all(fileIds.map(id => getFileMeta(id))).then(results => {
      setMetas(results.filter((m): m is StoredFileMeta => m !== null));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFiles(list: FileList) {
    setLoading(true);
    try {
      const added: StoredFileMeta[] = [];
      for (const file of Array.from(list)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 20 * 1_048_576) {
          alert(`"${file.name}" is groter dan 20 MB en wordt overgeslagen.`);
          continue;
        }
        const meta = await addFile(file);
        added.push(meta);
        const url = URL.createObjectURL(file);
        setPreviews(p => ({ ...p, [meta.id]: url }));
      }
      const updated = [...metas, ...added];
      setMetas(updated);
      onChange(updated.map(m => m.id));
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleOpen(id: string) {
    const blob = await getFileBlob(id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async function handleRemove(id: string) {
    await removeFile(id);
    const updated = metas.filter(m => m.id !== id);
    setMetas(updated);
    onChange(updated.map(m => m.id));
    setPreviews(p => { const n = { ...p }; delete n[id]; return n; });
  }

  async function loadPreview(id: string) {
    if (previews[id]) return;
    const blob = await getFileBlob(id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setPreviews(p => ({ ...p, [id]: url }));
  }

  return (
    <div className="photo-upload">
      {metas.length > 0 && (
        <div className="photo-grid">
          {metas.map(meta => {
            if (!previews[meta.id]) loadPreview(meta.id);
            return (
              <div key={meta.id} className="photo-thumb-wrap">
                <button
                  type="button"
                  className="photo-thumb-btn"
                  onClick={() => handleOpen(meta.id)}
                  title={meta.name}
                >
                  {previews[meta.id]
                    ? <img src={previews[meta.id]} alt={meta.name} className="photo-thumb" />
                    : <div className="photo-thumb-placeholder">&#128247;</div>
                  }
                </button>
                <button
                  type="button"
                  className="photo-remove"
                  onClick={() => handleRemove(meta.id)}
                  aria-label="Foto verwijderen"
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />
      <button
        type="button"
        className="btn btn-secondary invoice-add-btn"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? 'Uploaden...' : '+ Foto toevoegen'}
      </button>
    </div>
  );
}
