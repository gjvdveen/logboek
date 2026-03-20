import { useState, useCallback } from 'react';
import type { Trip, TripFormData } from '../types';

const STORAGE_KEY = 'boot-logboek-v1';

function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const trips = raw ? (JSON.parse(raw) as Trip[]) : [];
    // Migrate: ensure invoiceIds exists on older entries
    return trips.map(t => ({
      ...t,
      crewIds:       t.crewIds       ?? [],
      invoiceIds:    t.invoiceIds    ?? [],
      photoIds:      t.photoIds      ?? [],
      reisId:        t.reisId        ?? '',
      isDayLog:      t.isDayLog      ?? false,
      waterLevel:    t.waterLevel    ?? '',
      waterRefilled: t.waterRefilled ?? false,
      batteryPercent:t.batteryPercent?? '',
      solarKwh:      t.solarKwh      ?? '',
      tempCrew:      t.tempCrew      ?? [],
    }));
  } catch {
    return [];
  }
}

function saveTrips(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function useLogbook() {
  const [trips, setTrips] = useState<Trip[]>(loadTrips);

  const addTrip = useCallback((data: TripFormData) => {
    const trip: Trip = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setTrips(prev => { const next = [trip, ...prev]; saveTrips(next); return next; });
  }, []);

  const updateTrip = useCallback((id: string, data: TripFormData) => {
    setTrips(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...data } : t));
      saveTrips(next);
      return next;
    });
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => { const next = prev.filter(t => t.id !== id); saveTrips(next); return next; });
  }, []);

  return { trips, addTrip, updateTrip, deleteTrip };
}
