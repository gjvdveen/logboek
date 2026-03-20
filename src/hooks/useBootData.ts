import { useState, useCallback } from 'react';
import type { BootData } from '../types';

const STORAGE_KEY = 'boot-logboek-bootdata-v1';

const EMPTY: BootData = {
  naam: '', type: '', ligplaats: '', boxnr: '',
  lengte: '', breedte: '', diepgang: '',
  tankWater: '', tankBrandstof: '', maxAccu: '',
  bannerImageId: '',
};

function load(): BootData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function useBootData() {
  const [bootData, setBootData] = useState<BootData>(load);

  const saveBootData = useCallback((data: BootData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setBootData(data);
  }, []);

  return { bootData, saveBootData };
}
