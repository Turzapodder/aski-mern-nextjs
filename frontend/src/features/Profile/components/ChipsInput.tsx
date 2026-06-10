'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

interface ChipsInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  helperText?: string;
  maxItems?: number;
  variant?: 'settings' | 'profile';
}

const ChipsInput: React.FC<ChipsInputProps> = ({
  label,
  items,
  onChange,
  placeholder,
  helperText,
  maxItems,
  variant = 'settings',
}) => {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const normalized = useMemo(() => items.map((item) => item.trim()).filter(Boolean), [items]);

  useEffect(() => {
    if (error && maxItems !== undefined && normalized.length < maxItems) {
      setError('');
    }
  }, [error, maxItems, normalized.length]);

  const addItems = (rawValue: string) => {
    const raw = rawValue.trim();
    if (!raw) return;

    const candidates = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (candidates.length === 0) return;

    const existingLower = new Set(normalized.map((item) => item.toLowerCase()));
    const next = [...normalized];

    for (const candidate of candidates) {
      if (existingLower.has(candidate.toLowerCase())) {
        continue;
      }
      if (maxItems !== undefined && next.length >= maxItems) {
        setError(`Maximum ${maxItems} items allowed.`);
        break;
      }
      next.push(candidate);
      existingLower.add(candidate.toLowerCase());
    }

    onChange(next);
    setDraft('');
  };

  const handleRemove = (item: string) => {
    onChange(normalized.filter((value) => value !== item));
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
        {label}
      </label>

      {/* Unified input container with inline chips */}
      <div
        className={`min-h-[48px] w-full px-3 py-2 rounded-2xl border bg-gray-50/50 transition-all duration-200 flex flex-wrap items-center gap-1.5 ${
          isFocused
            ? 'border-black bg-white ring-2 ring-black/10'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
      >
        {normalized.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-500 text-gray-700 pl-3 pr-1.5 py-1 text-xs font-semibold animate-in fade-in zoom-in-95 duration-150"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="p-0.5 rounded-md hover:bg-white/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            addItems(draft);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addItems(draft);
            }
            if (e.key === 'Backspace' && !draft && normalized.length > 0) {
              handleRemove(normalized[normalized.length - 1]);
            }
          }}
          placeholder={normalized.length === 0 ? placeholder : 'Add more...'}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 py-1"
        />
      </div>

      {helperText && (
        <p className="mt-1.5 text-[11px] text-gray-400">{helperText}</p>
      )}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export default ChipsInput;
