import { useState, useCallback } from 'react';
import type { Reis, ReisFormData } from '../types';

const STORAGE_KEY = 'boot-logboek-reizen-v1';

function load(): Reis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const reizen = raw ? (JSON.parse(raw) as Reis[]) : [];
    return reizen.map(r => ({ ...r, crewIds: r.crewIds ?? [], startDate: r.startDate ?? '', endDate: r.endDate ?? '' }));
  } catch {
    return [];
  }
}

function save(entries: Reis[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useReizen() {
  const [reizen, setReizen] = useState<Reis[]>(load);

  const addReis = useCallback((data: ReisFormData) => {
    const reis: Reis = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setReizen(prev => { const next = [reis, ...prev]; save(next); return next; });
  }, []);

  const updateReis = useCallback((id: string, data: ReisFormData) => {
    setReizen(prev => {
      const next = prev.map(r => (r.id === id ? { ...r, ...data } : r));
      save(next);
      return next;
    });
  }, []);

  const deleteReis = useCallback((id: string) => {
    setReizen(prev => { const next = prev.filter(r => r.id !== id); save(next); return next; });
  }, []);

  return { reizen, addReis, updateReis, deleteReis };
}
