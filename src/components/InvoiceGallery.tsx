import { useState, useEffect } from 'react';
import { getFileMeta, getFileBlob, type StoredFileMeta } from '../utils/fileStore';

interface Props {
  fileIds: string[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024)      return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function typeLabel(mime: string): string {
  if (mime === 'application/pdf') return 'PDF';
  if (mime.startsWith('image/'))  return mime.split('/')[1].toUpperCase().slice(0, 4);
  return 'FILE';
}

export default function InvoiceGallery({ fileIds }: Props) {
  const [metas, setMetas] = useState<StoredFileMeta[]>([]);

  useEffect(() => {
    if (fileIds.length === 0) { setMetas([]); return; }
    Promise.all(fileIds.map(id => getFileMeta(id))).then(results => {
      setMetas(results.filter((m): m is StoredFileMeta => m !== null));
    });
  }, [fileIds]);

  if (metas.length === 0) return null;

  async function handleOpen(id: string) {
    const blob = await getFileBlob(id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <ul className="invoice-list invoice-list--readonly">
      {metas.map(meta => (
        <li key={meta.id} className="invoice-item">
          <button
            type="button"
            className="invoice-open invoice-open--full"
            onClick={() => handleOpen(meta.id)}
          >
            <span className="invoice-type-badge">{typeLabel(meta.type)}</span>
            <span className="invoice-info">
              <span className="invoice-name">{meta.name}</span>
              <span className="invoice-size">{formatSize(meta.size)}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
