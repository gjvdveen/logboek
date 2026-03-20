import { useState } from 'react';
import type { MaintenanceTask, MaintenanceFormData } from '../types';

const KEY = 'boot-logboek-maintenance-v1';

export function useMaintenanceLog() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
    catch { return []; }
  });

  function save(list: MaintenanceTask[]) {
    setTasks(list);
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  return {
    tasks,
    addTask: (d: MaintenanceFormData) =>
      save([...tasks, { ...d, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]),
    updateTask: (id: string, d: MaintenanceFormData) =>
      save(tasks.map(t => t.id === id ? { ...t, ...d } : t)),
    deleteTask: (id: string) =>
      save(tasks.filter(t => t.id !== id)),
    markDone: (id: string, engineHours: string) => {
      const today = new Date().toISOString().split('T')[0];
      save(tasks.map(t => t.id === id ? { ...t, lastDoneDate: today, lastDoneHours: engineHours } : t));
    },
  };
}
