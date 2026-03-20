interface Props {
  value: string;
  onChange: (v: string) => void;
}

const STEPS = [
  { value: 'goed',   label: 'Goed',   sub: '> 5 nm',  color: '#4caf50' },
  { value: 'matig',  label: 'Matig',  sub: '1 – 5 nm', color: '#ff9800' },
  { value: 'slecht', label: 'Slecht', sub: '< 1 nm',  color: '#f44336' },
];

export default function VisibilitySlider({ value, onChange }: Props) {
  const idx = STEPS.findIndex(s => s.value === value);
  const active = idx >= 0 ? STEPS[idx] : null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(STEPS[parseInt(e.target.value)].value);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(STEPS[Math.min(STEPS.length - 1, idx < 0 ? 0 : idx + 1)].value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(STEPS[Math.max(0, idx < 0 ? 0 : idx - 1)].value);
    }
  }

  return (
    <div className="vis-slider-wrap">
      <div className="vis-slider-track-wrap">
        <input
          type="range"
          min={0}
          max={STEPS.length - 1}
          step={1}
          value={idx >= 0 ? idx : 0}
          onChange={handleChange}
          onKeyDown={handleKey}
          className="vis-slider-input"
          style={active ? { '--thumb-color': active.color } as React.CSSProperties : undefined}
        />
        <div className="vis-slider-track-bg" />
        <div className="vis-slider-labels">
          {STEPS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`vis-slider-label-btn${value === s.value ? ' active' : ''}`}
              style={{ color: value === s.value ? s.color : undefined }}
              onClick={() => onChange(s.value)}
            >
              <span className="vis-label-main">{s.label}</span>
              <span className="vis-label-sub">{s.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="vis-slider-result" style={{ color: active.color }}>
          <strong>{active.label}</strong> — {active.sub}
        </div>
      )}
      {!active && (
        <div className="vis-slider-result vis-slider-result--empty">
          Klik of sleep om zichtbaarheid in te stellen
        </div>
      )}
    </div>
  );
}
