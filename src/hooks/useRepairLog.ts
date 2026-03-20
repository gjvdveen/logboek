import { useState, useCallback } from 'react';
import type { RepairEntry, RepairFormData } from '../types';

const STORAGE_KEY = 'boot-logboek-repairs-v1';

function load(): RepairEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const entries = raw ? (JSON.parse(raw) as RepairEntry[]) : [];
    return entries.map(e => ({ ...e, invoiceIds: e.invoiceIds ?? [], costType: e.costType ?? 'eenmalig' }));
  } catch {
    return [];
  }
}

function save(entries: RepairEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useRepairLog() {
  const [entries, setEntries] = useState<RepairEntry[]>(load);

  const addEntry = useCallback((data: RepairFormData) => {
    const entry: RepairEntry = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setEntries(prev => { const next = [entry, ...prev]; save(next); return next; });
  }, []);

  const updateEntry = useCallback((id: string, data: RepairFormData) => {
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
