interface Props {
  value: string;
  onChange: (v: string) => void;
}

const OPTIONS = [
  { value: 'zonnig',      label: 'Zonnig',       icon: '☀️'  },
  { value: 'halfbewolkt', label: 'Half bewolkt',  icon: '⛅'  },
  { value: 'bewolkt',     label: 'Bewolkt',       icon: '☁️'  },
  { value: 'regen',       label: 'Regen',         icon: '🌧️' },
  { value: 'mist',        label: 'Mist',          icon: '🌫️' },
  { value: 'onweer',      label: 'Onweer',        icon: '⛈️' },
];

export default function WeatherPicker({ value, onChange }: Props) {
  return (
    <div className="weather-picker">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`weather-btn${value === opt.value ? ' weather-btn--active' : ''}`}
          onClick={() => onChange(value === opt.value ? '' : opt.value)}
          title={opt.label}
          aria-pressed={value === opt.value}
        >
          <span className="weather-icon">{opt.icon}</span>
          <span className="weather-label">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
