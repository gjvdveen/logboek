import { useState, useCallback } from 'react';
import type { DayLog, DayLogFormData } from '../types';

const STORAGE_KEY = 'boot-logboek-daylog-v1';

function load(): DayLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DayLog[]) : [];
  } catch {
    return [];
  }
}

function save(entries: DayLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useDayLog() {
  const [entries, setEntries] = useState<DayLog[]>(load);

  const addEntry = useCallback((data: DayLogFormData) => {
    const entry: DayLog = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setEntries(prev => { const next = [entry, ...prev]; save(next); return next; });
  }, []);

  const updateEntry = useCallback((id: string, data: DayLogFormData) => {
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
