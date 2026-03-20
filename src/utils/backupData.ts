/**
 * Backup & restore – exporteert alle app-data als JSON-bestand.
 * Foto's en facturen (IndexedDB) worden niet meegenomen.
 */

const DATA_KEYS = [
  'boot-logboek-bootdata-v1',
  'boot-logboek-v1',
  'boot-logboek-fuel-v1',
  'boot-logboek-repairs-v1',
  'boot-logboek-crew-v1',
  'boot-logboek-daylog-v1',
  'boot-logboek-reizen-v1',
  'boot-logboek-seizoen-v1',
  'boot-logboek-maintenance-v1',
];

const BACKUP_VERSION = 1;

export function exportData() {
  const data: Record<string, unknown> = {};
  DATA_KEYS.forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) {
      try { data[k] = JSON.parse(v); }
      catch { data[k] = v; }
    }
  });

  const backup = {
    version:    BACKUP_VERSION,
    exportDate: new Date().toISOString(),
    app:        'boot-logboek',
    note:       'Foto\'s en factuurbestanden zijn niet opgenomen in deze backup.',
    data,
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);

  const date  = new Date().toISOString().slice(0, 10);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = `boot-logboek-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result as string);
        if (backup.app !== 'boot-logboek' || backup.version !== BACKUP_VERSION) {
          reject(new Error('Ongeldig backup-bestand.'));
          return;
        }
        const data = backup.data as Record<string, unknown>;
        DATA_KEYS.forEach(k => {
          if (k in data) localStorage.setItem(k, JSON.stringify(data[k]));
        });
        resolve();
      } catch {
        reject(new Error('Bestand kan niet worden gelezen. Controleer of het een geldig backup-bestand is.'));
      }
    };
    reader.onerror = () => reject(new Error('Bestand lezen mislukt.'));
    reader.readAsText(file);
  });
}
