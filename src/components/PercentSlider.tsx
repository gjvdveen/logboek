interface Props {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}

function levelColor(pct: number): string {
  if (pct <= 15) return '#e84020';
  if (pct <= 35) return '#f07020';
  if (pct <= 55) return '#f0d020';
  if (pct <= 75) return '#88c888';
  return '#4ca84c';
}

export default function PercentSlider({ value, onChange, id }: Props) {
  const num    = value !== '' ? Math.min(100, Math.max(0, parseInt(value, 10))) : -1;
  const pct    = num >= 0 ? num : 0;
  const color  = num >= 0 ? levelColor(num) : '#c8d4e0';
  const hasVal = num >= 0;

  return (
    <div className="pslider-wrap">
      <div className="pslider-header">
        {hasVal ? (
          <span className="pslider-value" style={{ color }}>{num}%</span>
        ) : (
          <span className="pslider-empty">—</span>
        )}
      </div>

      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={pct}
        onChange={e => onChange(e.target.value)}
        className="pslider-input"
        style={{
          '--ps-pct':   `${pct}%`,
          '--ps-color': color,
        } as React.CSSProperties}
      />

      <div className="pslider-ticks">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
