import { useState, useCallback } from 'react';
import type { FuelEntry, FuelFormData } from '../types';

const STORAGE_KEY = 'boot-logboek-fuel-v1';

function load(): FuelEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const entries = raw ? (JSON.parse(raw) as FuelEntry[]) : [];
    return entries.map(e => ({ ...e, invoiceIds: e.invoiceIds ?? [] }));
  } catch {
    return [];
  }
}

function save(entries: FuelEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useFuelLog() {
  const [entries, setEntries] = useState<FuelEntry[]>(load);

  const addEntry = useCallback((data: FuelFormData) => {
    const entry: FuelEntry = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setEntries(prev => { const next = [entry, ...prev]; save(next); return next; });
  }, []);

  const updateEntry = useCallback((id: string, data: FuelFormData) => {
    setEntries(prev => {
      const next = prev.map(e => (e.id === id ? { ...e, ...data } : e));
      save(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => { const next = prev.filter(e => e.id !== id); save(next); return next; });
  }, []);

  return { entries, addEntry, updateEntry, deleteEntry };
}
