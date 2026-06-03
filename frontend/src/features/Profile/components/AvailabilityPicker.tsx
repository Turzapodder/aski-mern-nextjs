'use client';

import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { AvailabilityValue, WEEKDAYS, validateDaySlots } from '@/lib/availability';

interface AvailabilityPickerProps {
  value: AvailabilityValue;
  onChange: (value: AvailabilityValue) => void;
  variant?: 'settings' | 'profile';
}

const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  value,
  onChange,
  variant = 'settings',
}) => {
  const [slotDrafts, setSlotDrafts] = useState<Record<string, string>>({});
  const [slotErrors, setSlotErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setSlotDrafts((prev) => {
      const next = { ...prev };
      value.days.forEach((day) => {
        if (!(day in next)) {
          next[day] = '';
        }
      });
      Object.keys(next).forEach((day) => {
        if (!value.days.includes(day)) {
          delete next[day];
        }
      });
      return next;
    });
  }, [value.days]);

  const styles =
    variant === 'profile'
      ? {
          selected: 'border-indigo-200 bg-indigo-50/60',
          focus: 'focus:ring-indigo-200 focus:border-indigo-600',
          checkbox: 'text-indigo-600 focus:ring-indigo-200',
          button: 'border-gray-200 text-gray-700 hover:bg-gray-50',
        }
      : {
          selected: 'border-primary-200 bg-primary-50',
          focus: 'focus:ring-primary-200',
          checkbox: 'text-primary-600 focus:ring-primary-200',
          button: 'border-gray-200 text-gray-700 hover:bg-gray-50',
        };

  const toggleDay = (day: string) => {
    const isSelected = value.days.includes(day);
    const nextDays = isSelected
      ? value.days.filter((item) => item !== day)
      : [...value.days, day].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));

    const nextSlots = { ...value.slotsByDay };
    if (isSelected) {
      delete nextSlots[day];
      setSlotErrors((prev) => {
        if (!prev[day]) return prev;
        const next = { ...prev };
        delete next[day];
        return next;
      });
    } else if (!nextSlots[day]) {
      nextSlots[day] = [];
    }

    onChange({
      days: nextDays,
      slotsByDay: nextSlots,
    });
  };

  const handleDraftChange = (day: string, value: string) => {
    setSlotDrafts((prev) => ({ ...prev, [day]: value }));
    setSlotErrors((prev) => ({ ...prev, [day]: '' }));
  };

  const handleAddSlot = (day: string) => {
    const draft = slotDrafts[day]?.trim();
    if (!draft) return;

    const existing = value.slotsByDay[day] || [];
    if (existing.includes(draft)) {
      setSlotDrafts((prev) => ({ ...prev, [day]: '' }));
      return;
    }

    const nextSlots = [...existing, draft];
    const validationError = validateDaySlots(day, nextSlots);
    if (validationError) {
      setSlotErrors((prev) => ({
        ...prev,
        [day]: validationError,
      }));
      return;
    }

    const nextSlotsByDay = {
      ...value.slotsByDay,
      [day]: nextSlots,
    };

    onChange({
      days: value.days,
      slotsByDay: nextSlotsByDay,
    });

    setSlotErrors((prev) => ({ ...prev, [day]: '' }));
    setSlotDrafts((prev) => ({ ...prev, [day]: '' }));
  };

  const handleRemoveSlot = (day: string, slot: string) => {
    const existing = value.slotsByDay[day] || [];
    const nextSlots = existing.filter((item) => item !== slot);

    onChange({
      days: value.days,
      slotsByDay: {
        ...value.slotsByDay,
        [day]: nextSlots,
      },
    });

    setSlotErrors((prev) => ({ ...prev, [day]: '' }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WEEKDAYS.map((day) => {
          const isSelected = value.days.includes(day);
          const slots = value.slotsByDay[day] || [];
          const validationError = isSelected ? validateDaySlots(day, slots) : null;
          const errorMessage = slotErrors[day] || validationError;
          const hasError = Boolean(errorMessage);

          return (
            <div
              key={day}
              className={`rounded-lg border p-4 ${
                hasError
                  ? 'border-rose-200 bg-rose-50'
                  : isSelected
                    ? styles.selected
                    : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleDay(day)}
                    className={`h-4 w-4 rounded border-gray-300 ${styles.checkbox}`}
                  />
                  {day}
                </label>
                {isSelected && <span className="text-xs text-gray-400">Selected</span>}
              </div>

              {isSelected && (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {slots.length > 0 ? (
                      slots.map((slot) => (
                        <span
                          key={`${day}-${slot}`}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200"
                        >
                          {slot}
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(day, slot)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No slots added yet.</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-500">Add time slot</label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={slotDrafts[day] || ''}
                        onChange={(e) => handleDraftChange(day, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSlot(day);
                          }
                        }}
                        placeholder="09:00-11:00"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 ${styles.focus}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSlot(day)}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${styles.button}`}
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                    {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
                  </div>

                  {/* Dynamic Auto-Generator Wizard */}
                  <div className="mt-3 pt-3 border-t border-gray-100/60">
                    <details className="group">
                      <summary className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer list-none flex items-center gap-1 select-none">
                        <span>⚡ Auto-Generate Time Blocks</span>
                        <span className="transition-transform group-open:rotate-180">▼</span>
                      </summary>
                      <div className="mt-3 p-3 rounded-lg bg-gray-50/50 border border-gray-150 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-medium text-gray-400 block mb-1">Start Hour</label>
                            <select
                              id={`gen-start-${day}`}
                              defaultValue="09"
                              className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {Array.from({ length: 24 }).map((_, i) => {
                                const h = i.toString().padStart(2, '0');
                                return <option key={h} value={h}>{h}:00</option>;
                              })}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-gray-400 block mb-1">End Hour</label>
                            <select
                              id={`gen-end-${day}`}
                              defaultValue="17"
                              className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {Array.from({ length: 24 }).map((_, i) => {
                                const h = i.toString().padStart(2, '0');
                                return <option key={h} value={h}>{h}:00</option>;
                              })}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-gray-400 block mb-1">Duration</label>
                            <select
                              id={`gen-size-${day}`}
                              defaultValue="60"
                              className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="30">30 mins</option>
                              <option value="60">60 mins</option>
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const startVal = Number((document.getElementById(`gen-start-${day}`) as HTMLSelectElement)?.value || '9');
                            const endVal = Number((document.getElementById(`gen-end-${day}`) as HTMLSelectElement)?.value || '17');
                            const durationVal = Number((document.getElementById(`gen-size-${day}`) as HTMLSelectElement)?.value || '60');
                            
                            if (startVal >= endVal) {
                              alert('Start hour must be before end hour');
                              return;
                            }

                            const generated: string[] = [];
                            let curr = startVal * 60;
                            const limit = endVal * 60;

                            while (curr + durationVal <= limit) {
                              const sh = Math.floor(curr / 60).toString().padStart(2, '0');
                              const sm = (curr % 60).toString().padStart(2, '0');
                              curr += durationVal;
                              const eh = Math.floor(curr / 60).toString().padStart(2, '0');
                              const em = (curr % 60).toString().padStart(2, '0');
                              generated.push(`${sh}:${sm}-${eh}:${em}`);
                            }

                            onChange({
                              days: value.days,
                              slotsByDay: {
                                ...value.slotsByDay,
                                [day]: generated
                              }
                            });
                          }}
                          className="w-full py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-sm"
                        >
                          Auto-Generate Blocks
                        </button>
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">
        Use 24-hour time format (HH:MM-HH:MM). Add multiple slots per day.
      </p>
    </div>
  );
};

export default AvailabilityPicker;
