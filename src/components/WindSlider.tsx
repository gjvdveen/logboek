import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const BEAUFORT_LABELS = [
  'Windstil', 'Zwakke wind', 'Zwakke wind', 'Zwakke wind',
  'Matige wind', 'Matige bries', 'Stevige bries',
  'Harde wind', 'Stormachtig', 'Storm',
  'Zware storm', 'Zeer zware storm', 'Orkaan',
];

// Color stops per Beaufort level
const BEAUFORT_COLORS = [
  '#a8d8a8', // 0  groen
  '#88c888', // 1
  '#68b868', // 2
  '#4ca84c', // 3
  '#d4e04a', // 4  geel
  '#f0d020', // 5
  '#f0a820', // 6
  '#f07020', // 7  oranje
  '#e84020', // 8
  '#c81010', // 9  rood
  '#a80000', // 10
  '#780050', // 11 paars
  '#500080', // 12
];

export default function WindSlider({ value, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const num = value !== '' ? parseInt(value, 10) : -1;
  const color = num >= 0 && num <= 12 ? BEAUFORT_COLORS[num] : '#d1dce8';

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const bft = Math.round(ratio * 12);
    onChange(String(bft));
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(String(Math.min(12, num < 0 ? 0 : num + 1)));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(String(Math.max(0, num < 0 ? 0 : num - 1)));
    }
  }

  const pct = num >= 0 ? (num / 12) * 100 : 0;

  return (
    <div className="wind-slider-wrap">
      <div
        ref={trackRef}
        className="wind-slider-track"
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={12}
        aria-valuenow={num >= 0 ? num : undefined}
        aria-label="Windkracht Beaufort"
        onClick={handleClick}
        onKeyDown={handleKey}
        style={{
          background: `linear-gradient(to right,
            #a8d8a8 0%, #68b868 25%, #f0d020 42%, #f07020 58%, #e84020 75%, #780050 92%, #500080 100%
          )`,
        }}
      >
        {num >= 0 && (
          <div
            className="wind-slider-thumb"
            style={{ left: `${pct}%`, background: color }}
          />
        )}
        <div className="wind-slider-ticks">
          {[0, 3, 6, 9, 12].map(i => (
            <span key={i} className="wind-slider-tick" style={{ left: `${(i / 12) * 100}%` }}>{i}</span>
          ))}
        </div>
      </div>

      {num >= 0 && (
        <div className="wind-slider-label" style={{ color }}>
          <strong>Bft {num}</strong> — {BEAUFORT_LABELS[num]}
        </div>
      )}
      {num < 0 && (
        <div className="wind-slider-label wind-slider-label--empty">
          Klik op de balk om windkracht in te stellen
        </div>
      )}
    </div>
  );
}
