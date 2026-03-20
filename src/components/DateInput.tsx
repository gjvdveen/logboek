import { useRef } from 'react';

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Native date input with a clickable calendar icon that opens the picker. */
export default function DateInput({ id, value, onChange, className = '' }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  function openPicker() {
    // showPicker() is supported in all modern browsers
    try { ref.current?.showPicker(); } catch { ref.current?.focus(); }
  }

  return (
    <div className="date-input-wrap">
      <input
        ref={ref}
        id={id}
        type="date"
        className={`form-control date-input ${className}`.trim()}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <button
        type="button"
        className="date-icon-btn"
        onClick={openPicker}
        tabIndex={-1}
        aria-label="Kalender openen"
      >
        {/* Calendar SVG */}
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 9h16" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="6.5"  cy="13" r="1" fill="currentColor"/>
          <circle cx="10"   cy="13" r="1" fill="currentColor"/>
          <circle cx="13.5" cy="13" r="1" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
}
