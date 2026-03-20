import { useState, useEffect, useRef } from 'react';
import { addFile, getFileMeta, getFileBlob, removeFile, type StoredFileMeta } from '../utils/fileStore';

interface Props {
  fileIds: string[];
  onChange: (ids: string[]) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1_048_576)   return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function typeLabel(mime: string): string {
  if (mime === 'application/pdf') return 'PDF';
  if (mime.startsWith('image/'))  return mime.split('/')[1].toUpperCase().slice(0, 4);
  return 'FILE';
}

export default function InvoiceUpload({ fileIds, onChange }: Props) {
  const [metas,    setMetas]    = useState<StoredFileMeta[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load metadata for IDs that were already stored (edit mode)
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
        if (file.size > 10 * 1_048_576) {
          alert(`"${file.name}" is groter dan 10 MB en wordt overgeslagen.`);
          continue;
        }
        const meta = await addFile(file);
        added.push(meta);
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPreviews(p => ({ ...p, [meta.id]: url }));
        }
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

  return (
    <div className="invoice-upload">
      {metas.length > 0 && (
        <ul className="invoice-list">
          {metas.map(meta => (
            <li key={meta.id} className="invoice-item">
              <button
                type="button"
                className="invoice-open"
                onClick={() => handleOpen(meta.id)}
                title="Openen"
              >
                {previews[meta.id]
                  ? <img src={previews[meta.id]} alt={meta.name} className="invoice-thumb" />
                  : <span className="invoice-type-badge">{typeLabel(meta.type)}</span>
                }
                <span className="invoice-info">
                  <span className="invoice-name">{meta.name}</span>
                  <span className="invoice-size">{formatSize(meta.size)}</span>
                </span>
              </button>
              <button
                type="button"
                className="invoice-remove"
                onClick={() => handleRemove(meta.id)}
                aria-label="Verwijder factuur"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
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
        {loading ? 'Uploaden...' : '+ Factuur / bon toevoegen'}
      </button>
    </div>
  );
}
