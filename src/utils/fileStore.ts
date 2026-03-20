export interface StoredFileMeta {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
}

interface StoredRecord extends StoredFileMeta {
  data: ArrayBuffer;
}

const DB_NAME = 'boot-logboek-files-v1';
const STORE   = 'files';

let _db: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => { _db = req.result; resolve(req.result); };
    req.onerror   = () => reject(req.error);
  });
}

export async function addFile(file: File): Promise<StoredFileMeta> {
  const db   = await getDB();
  const id   = crypto.randomUUID();
  const data = await file.arrayBuffer();
  const record: StoredRecord = {
    id,
    name:      file.name,
    type:      file.type || 'application/octet-stream',
    size:      file.size,
    createdAt: new Date().toISOString(),
    data,
  };
  await idbPut(db, record);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _data, ...meta } = record;
  return meta;
}

export async function getFileMeta(id: string): Promise<StoredFileMeta | null> {
  const db  = await getDB();
  const rec = await idbGet(db, id) as StoredRecord | null;
  if (!rec) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _data, ...meta } = rec;
  return meta;
}

export async function getFileBlob(id: string): Promise<Blob | null> {
  const db  = await getDB();
  const rec = await idbGet(db, id) as StoredRecord | null;
  if (!rec) return null;
  return new Blob([rec.data], { type: rec.type });
}

export async function removeFile(id: string): Promise<void> {
  const db = await getDB();
  await idbDelete(db, id);
}

/* ── IDB helpers ── */

function idbPut(db: IDBDatabase, value: unknown): Promise<void> {
  return new Promise((res, rej) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(value);
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<unknown> {
  return new Promise((res, rej) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => res(req.result ?? null);
    req.onerror   = () => rej(req.error);
  });
}

function idbDelete(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((res, rej) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key);
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  });
}
