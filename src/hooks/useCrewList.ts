import { useState, useCallback } from 'react';
import type { CrewMember, CrewFormData } from '../types';

const STORAGE_KEY = 'boot-logboek-crew-v1';

function load(): CrewMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CrewMember[]) : [];
  } catch {
    return [];
  }
}

function save(members: CrewMember[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function useCrewList() {
  const [members, setMembers] = useState<CrewMember[]>(load);

  const addMember = useCallback((data: CrewFormData) => {
    const member: CrewMember = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setMembers(prev => { const next = [...prev, member]; save(next); return next; });
  }, []);

  const updateMember = useCallback((id: string, data: CrewFormData) => {
    setMembers(prev => {
      const next = prev.map(m => (m.id === id ? { ...m, ...data } : m));
      save(next);
      return next;
    });
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers(prev => { const next = prev.filter(m => m.id !== id); save(next); return next; });
  }, []);

  return { members, addMember, updateMember, deleteMember };
}
