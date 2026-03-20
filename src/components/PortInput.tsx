import { useState, useRef, useEffect } from 'react';

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions: string[];
  className?: string;
}

export default function PortInput({ id, value, onChange, placeholder, suggestions, className = '' }: Props) {
  const [open,      setOpen]      = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Filter: when input is empty show all, otherwise match substring
  const visible = suggestions.filter(s =>
    s.toLowerCase() !== value.toLowerCase().trim() &&
    (!value.trim() || s.toLowerCase().includes(value.toLowerCase().trim()))
  );

  // Reset keyboard cursor whenever the list changes
  useEffect(() => { setActiveIdx(-1); }, [value, open]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function select(port: string) {
    onChange(port);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || visible.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, visible.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      select(visible[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="port-wrap">
      <input
        id={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        className={`form-control ${className}`.trim()}
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {open && visible.length > 0 && (
        <ul className="port-dropdown" role="listbox">
          {visible.map((port, idx) => (
            <li
              key={port}
              role="option"
              aria-selected={idx === activeIdx}
              className={`port-option${idx === activeIdx ? ' port-option--active' : ''}`}
              onMouseDown={e => { e.preventDefault(); select(port); }}
            >
              {port}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
