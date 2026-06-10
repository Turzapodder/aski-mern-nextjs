'use client';

import React, { useEffect, useState } from 'react';
import { Plus, X, Clock, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { AvailabilityValue, WEEKDAYS, validateDaySlots } from '@/lib/availability';

interface AvailabilityPickerProps {
  value: AvailabilityValue;
  onChange: (value: AvailabilityValue) => void;
  variant?: 'settings' | 'profile';
}

const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  value,
  onChange,
}) => {
  const [slotDrafts, setSlotDrafts] = useState<Record<string, string>>({});
  const [slotErrors, setSlotErrors] = useState<Record<string, string>>({});
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [genStart, setGenStart] = useState<Record<string, string>>({});
  const [genEnd, setGenEnd] = useState<Record<string, string>>({});
  const [genDuration, setGenDuration] = useState<Record<string, string>>({});

  useEffect(() => {
    setSlotDrafts((prev) => {
      const next = { ...prev };
      value.days.forEach((day) => {
        if (!(day in next)) next[day] = '';
      });
      Object.keys(next).forEach((day) => {
        if (!value.days.includes(day)) delete next[day];
      });
      return next;
    });
  }, [value.days]);

  const toggleDay = (day: string) => {
    const isSelected = value.days.includes(day);
    const nextDays = isSelected
      ? value.days.filter((item) => item !== day)
      : [...value.days, day].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));

    const nextSlots = { ...value.slotsByDay };
    if (isSelected) {
      delete nextSlots[day];
      if (expandedDay === day) setExpandedDay(null);
      setSlotErrors((prev) => {
        if (!prev[day]) return prev;
        const next = { ...prev };
        delete next[day];
        return next;
      });
    } else if (!nextSlots[day]) {
      nextSlots[day] = [];
      setExpandedDay(day);
    }

    onChange({ days: nextDays, slotsByDay: nextSlots });
  };

  const handleDraftChange = (day: string, val: string) => {
    setSlotDrafts((prev) => ({ ...prev, [day]: val }));
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
      setSlotErrors((prev) => ({ ...prev, [day]: validationError }));
      return;
    }

    onChange({
      days: value.days,
      slotsByDay: { ...value.slotsByDay, [day]: nextSlots },
    });

    setSlotErrors((prev) => ({ ...prev, [day]: '' }));
    setSlotDrafts((prev) => ({ ...prev, [day]: '' }));
  };

  const handleRemoveSlot = (day: string, slot: string) => {
    const existing = value.slotsByDay[day] || [];
    onChange({
      days: value.days,
      slotsByDay: { ...value.slotsByDay, [day]: existing.filter((s) => s !== slot) },
    });
    setSlotErrors((prev) => ({ ...prev, [day]: '' }));
  };

  const handleAutoGenerate = (day: string) => {
    const startVal = Number(genStart[day] || '9');
    const endVal = Number(genEnd[day] || '17');
    const durationVal = Number(genDuration[day] || '60');

    if (startVal >= endVal) return;

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
      slotsByDay: { ...value.slotsByDay, [day]: generated },
    });
  };

  return (
    <div className="space-y-4">
      {/* Day Selector Strip */}
      <div>
        <p className="text-[11px] font-medium text-gray-400 mb-2">
          Tap a day to mark yourself available, then configure time slots.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((day) => {
            const isSelected = value.days.includes(day);
            const slots = value.slotsByDay[day] || [];
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`relative flex flex-col items-center gap-0.5 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 select-none ${
                  isSelected
                    ? 'bg-secondary-500 text-black shadow-md shadow-gray-200'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-100 hover:text-gray-600 border border-gray-100'
                }`}
              >
                <span className="text-sm tracking-wider">{DAY_SHORT[day]}</span>
                {isSelected && slots.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {slots.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Days Detail Panels */}
      {value.days.length > 0 && (
        <div className="space-y-2">
          {value.days.map((day) => {
            const slots = value.slotsByDay[day] || [];
            const isExpanded = expandedDay === day;
            const errorMessage = slotErrors[day] || (slots.length > 0 ? validateDaySlots(day, slots) : null);

            return (
              <div
                key={day}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                  errorMessage
                    ? 'border-rose-200 bg-rose-50/50'
                    : isExpanded
                      ? 'border-gray-200 bg-white shadow-sm'
                      : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                }`}
              >
                {/* Day Header */}
                <button
                  type="button"
                  onClick={() => setExpandedDay(isExpanded ? null : day)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-[11px] font-bold">
                      {DAY_SHORT[day].slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900">{day}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-[11px] text-gray-400">
                          {slots.length === 0
                            ? 'No time slots configured'
                            : `${slots.length} slot${slots.length > 1 ? 's' : ''}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Inline slot preview when collapsed */}
                    {!isExpanded && slots.length > 0 && (
                      <div className="hidden sm:flex flex-wrap gap-1 max-w-[300px]">
                        {slots.slice(0, 3).map((slot) => (
                          <span
                            key={`${day}-preview-${slot}`}
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold text-gray-600"
                          >
                            {slot}
                          </span>
                        ))}
                        {slots.length > 3 && (
                          <span className="text-[10px] text-gray-400 font-medium self-center">
                            +{slots.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Existing Slots */}
                    {slots.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {slots.map((slot) => (
                          <span
                            key={`${day}-${slot}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-black text-white pl-2.5 pr-1.5 py-1 text-xs font-semibold"
                          >
                            <Clock className="w-3 h-3 opacity-60" />
                            {slot}
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(day, slot)}
                              className="p-0.5 rounded hover:bg-white/20 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Manual Add */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
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
                          placeholder="e.g. 09:00-11:00"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all placeholder-gray-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddSlot(day)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </button>
                    </div>

                    {errorMessage && (
                      <p className="text-xs text-rose-500 font-medium">{errorMessage}</p>
                    )}

                    {/* Quick Generate */}
                    <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-400 mr-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Auto-fill</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={genStart[day] || '09'}
                          onChange={(e) => setGenStart((p) => ({ ...p, [day]: e.target.value }))}
                          className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
                        >
                          {Array.from({ length: 24 }).map((_, i) => {
                            const h = i.toString().padStart(2, '0');
                            return <option key={h} value={h}>{h}:00</option>;
                          })}
                        </select>
                        <span className="text-xs text-gray-400">→</span>
                        <select
                          value={genEnd[day] || '17'}
                          onChange={(e) => setGenEnd((p) => ({ ...p, [day]: e.target.value }))}
                          className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
                        >
                          {Array.from({ length: 24 }).map((_, i) => {
                            const h = i.toString().padStart(2, '0');
                            return <option key={h} value={h}>{h}:00</option>;
                          })}
                        </select>
                        <select
                          value={genDuration[day] || '60'}
                          onChange={(e) => setGenDuration((p) => ({ ...p, [day]: e.target.value }))}
                          className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
                        >
                          <option value="30">30m</option>
                          <option value="60">60m</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutoGenerate(day)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gray-900 text-white hover:bg-black transition-colors"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-gray-400">
        Use 24-hour format (HH:MM-HH:MM). Multiple slots per day are supported.
      </p>
    </div>
  );
};

export default AvailabilityPicker;
