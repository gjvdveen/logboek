import { useState, useEffect } from 'react';
import { getFileMeta, getFileBlob, type StoredFileMeta } from '../utils/fileStore';

interface Props {
  fileIds: string[];
}

export default function PhotoGallery({ fileIds }: Props) {
  const [metas,    setMetas]    = useState<StoredFileMeta[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    if (fileIds.length === 0) { setMetas([]); return; }
    Promise.all(fileIds.map(id => getFileMeta(id))).then(results => {
      setMetas(results.filter((m): m is StoredFileMeta => m !== null));
    });
  }, [fileIds]);

  async function loadPreview(id: string) {
    if (previews[id]) return;
    const blob = await getFileBlob(id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setPreviews(p => ({ ...p, [id]: url }));
  }

  async function handleOpen(id: string) {
    const blob = await getFileBlob(id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  if (metas.length === 0) return null;

  return (
    <div className="photo-grid photo-grid--readonly">
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
          </div>
        );
      })}
    </div>
  );
}
