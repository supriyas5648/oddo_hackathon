import { useEffect, useState } from 'react';

/**
 * Debounced search input. Reports the value upward via onChange after the
 * user stops typing so we don't fire a request on every keystroke.
 */
export default function SearchBar({ value, onChange, placeholder = 'Search…', delay = 350 }) {
  const [local, setLocal] = useState(value || '');

  // Keep local state in sync if the parent clears/changes the value.
  useEffect(() => setLocal(value || ''), [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      <input
        type="text"
        className="input pl-9"
        placeholder={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
    </div>
  );
}
