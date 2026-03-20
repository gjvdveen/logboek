export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(date: string, time: string): string {
  if (!date) return '';
  const formatted = formatDate(date);
  return time ? `${formatted} om ${time}` : formatted;
}

export function weatherLabel(weather: string): string {
  const map: Record<string, string> = {
    zonnig:      'Zonnig',
    halfbewolkt: 'Half bewolkt',
    bewolkt:     'Bewolkt',
    regen:       'Regen',
    mist:        'Mist',
    onweer:      'Onweer',
  };
  return map[weather] ?? weather;
}

export function weatherIcon(weather: string): string {
  const map: Record<string, string> = {
    zonnig:      '☀️',
    halfbewolkt: '⛅',
    bewolkt:     '☁️',
    regen:       '🌧️',
    mist:        '🌫️',
    onweer:      '⛈️',
  };
  return map[weather] ?? '';
}

export function beaufortLabel(force: string): string {
  const num = parseInt(force, 10);
  if (isNaN(num)) return '';
  const labels = [
    'windstil', 'flauwe koelte', 'lichte koelte', 'zwakke wind',
    'matige wind', 'frisse bries', 'krachtige wind', 'harde wind',
    'stormachtig', 'storm', 'zware storm', 'zeer zware storm', 'orkaan',
  ];
  return labels[num] ?? '';
}

export function computeDuration(
  depDate: string, depTime: string,
  arrDate: string, arrTime: string,
): string {
  if (!depDate || !depTime || !arrDate || !arrTime) return '';
  const dep = new Date(`${depDate}T${depTime}`);
  const arr = new Date(`${arrDate}T${arrTime}`);
  const diffMs = arr.getTime() - dep.getTime();
  if (diffMs <= 0) return '';
  const hours = Math.floor(diffMs / 3_600_000);
  const mins  = Math.floor((diffMs % 3_600_000) / 60_000);
  if (hours === 0) return `${mins} min`;
  if (mins  === 0) return `${hours} u`;
  return `${hours} u ${mins} min`;
}
