"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

interface ChipsInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  helperText?: string;
  maxItems?: number;
  variant?: "settings" | "profile";
}

const ChipsInput: React.FC<ChipsInputProps> = ({
  label,
  items,
  onChange,
  placeholder,
  helperText,
  maxItems,
  variant = "settings",
}) => {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const styles =
    variant === "profile"
      ? {
          label: "text-sm font-semibold text-gray-900 mb-2",
          input:
            "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors",
          chip:
            "inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200",
          button:
            "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50",
        }
      : {
          label: "text-sm font-medium text-gray-700 mb-2",
          input:
            "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500",
          chip:
            "inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200",
          button:
            "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50",
        };

  const normalized = useMemo(
    () => items.map((item) => item.trim()).filter(Boolean),
    [items]
  );

  useEffect(() => {
    if (error && maxItems !== undefined && normalized.length < maxItems) {
      setError("");
    }
  }, [error, maxItems, normalized.length]);

  const addItems = (rawValue: string) => {
    const raw = rawValue.trim();
    if (!raw) return;

    const candidates = raw
      .split(",")
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
    setDraft("");
  };

  const handleRemove = (item: string) => {
    onChange(normalized.filter((value) => value !== item));
  };

  return (
    <div>
      <label className={styles.label}>{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {normalized.length > 0 ? (
          normalized.map((item) => (
            <span key={item} className={styles.chip}>
              {item}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400">No items added yet.</span>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addItems(draft);
            }
          }}
          onBlur={() => addItems(draft)}
          placeholder={placeholder}
          className={styles.input}
        />
        <button
          type="button"
          onClick={() => addItems(draft)}
          className={styles.button}
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      {helperText && (
        <p className="mt-2 text-xs text-gray-500">{helperText}</p>
      )}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export default ChipsInput;
