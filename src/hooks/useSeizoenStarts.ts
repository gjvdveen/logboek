import { useState, useCallback } from 'react';
import type { SeizoenStart, SeizoenStartFormData } from '../types';

const STORAGE_KEY = 'boot-logboek-seizoen-v1';

function load(): SeizoenStart[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SeizoenStart[]) : [];
  } catch {
    return [];
  }
}

function save(entries: SeizoenStart[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useSeizoenStarts() {
  const [seizoenStarts, setSeizoenStarts] = useState<SeizoenStart[]>(load);

  const addSeizoenStart = useCallback((data: SeizoenStartFormData) => {
    const entry: SeizoenStart = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setSeizoenStarts(prev => { const next = [entry, ...prev]; save(next); return next; });
  }, []);

  const updateSeizoenStart = useCallback((id: string, data: SeizoenStartFormData) => {
    setSeizoenStarts(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...data } : e);
      save(next);
      return next;
    });
  }, []);

  const deleteSeizoenStart = useCallback((id: string) => {
    setSeizoenStarts(prev => { const next = prev.filter(e => e.id !== id); save(next); return next; });
  }, []);

  return { seizoenStarts, addSeizoenStart, updateSeizoenStart, deleteSeizoenStart };
}
