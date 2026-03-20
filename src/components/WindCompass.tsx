import { WIND_DIRECTIONS } from '../types';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const CX = 100, CY = 100, R = 82;

export default function WindCompass({ value, onChange }: Props) {
  const idx = WIND_DIRECTIONS.indexOf(value as typeof WIND_DIRECTIONS[number]);
  const hasValue = idx >= 0;

  // Arrow angle in SVG coords: N = -90°
  const arrowAngle = hasValue ? (idx * 22.5 - 90) * (Math.PI / 180) : null;

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - CX;
    const y = e.clientY - rect.top - CY;
    const angleDeg = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const normalized = ((angleDeg % 360) + 360) % 360;
    const nearest = Math.round(normalized / 22.5) % 16;
    onChange(WIND_DIRECTIONS[nearest]);
  }

  return (
    <div className="wind-compass-wrap">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        onClick={handleClick}
        className="wind-compass"
        style={{ cursor: 'crosshair' }}
      >
        {/* Outer ring */}
        <circle cx={CX} cy={CY} r={R} fill="#eef4fa" stroke="#c8d9ea" strokeWidth="2" />

        {/* Cardinal cross lines */}
        {[0, 90].map(deg => {
          const a = deg * (Math.PI / 180);
          return (
            <line key={deg}
              x1={CX - (R - 4) * Math.cos(a)} y1={CY - (R - 4) * Math.sin(a)}
              x2={CX + (R - 4) * Math.cos(a)} y2={CY + (R - 4) * Math.sin(a)}
              stroke="#d1dce8" strokeWidth="1"
            />
          );
        })}

        {/* Direction labels */}
        {WIND_DIRECTIONS.map((dir, i) => {
          const angle = (i * 22.5 - 90) * (Math.PI / 180);
          const isPrimary = i % 4 === 0;
          const isIntercardinal = i % 2 === 0 && !isPrimary;
          const labelR = R - (isPrimary ? 15 : isIntercardinal ? 16 : 17);
          const lx = CX + labelR * Math.cos(angle);
          const ly = CY + labelR * Math.sin(angle);
          const isSelected = dir === value;

          return (
            <text
              key={dir}
              x={lx} y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isPrimary ? 12 : isIntercardinal ? 9 : 7}
              fontWeight={isSelected ? 700 : isPrimary ? 600 : 400}
              fill={isSelected ? '#1a6b8a' : isPrimary ? '#0d2b45' : '#6b7a8d'}
            >
              {dir}
            </text>
          );
        })}

        {/* Arrow when direction is selected */}
        {arrowAngle !== null && (() => {
          const arrowLen = 46;
          const tailLen = 18;
          const x2 = CX + arrowLen * Math.cos(arrowAngle);
          const y2 = CY + arrowLen * Math.sin(arrowAngle);
          const xt = CX - tailLen * Math.cos(arrowAngle);
          const yt = CY - tailLen * Math.sin(arrowAngle);
          return (
            <>
              <line x1={xt} y1={yt} x2={x2} y2={y2}
                stroke="#1a6b8a" strokeWidth="3" strokeLinecap="round" />
              <circle cx={x2} cy={y2} r={5} fill="#1a6b8a" />
              <circle cx={CX} cy={CY} r={4} fill="#0d2b45" />
            </>
          );
        })()}

        {/* Prompt when no value */}
        {!hasValue && (
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
            fontSize="9" fill="#9aabbf">
            Klik voor richting
          </text>
        )}
      </svg>

      {value && (
        <div className="wind-compass-label">{value}</div>
      )}
    </div>
  );
}
