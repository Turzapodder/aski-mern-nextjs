"use client";

import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  AvailabilityValue,
  WEEKDAYS,
  validateDaySlots,
} from "@/lib/availability";

interface AvailabilityPickerProps {
  value: AvailabilityValue;
  onChange: (value: AvailabilityValue) => void;
  variant?: "settings" | "profile";
}

const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  value,
  onChange,
  variant = "settings",
}) => {
  const [slotDrafts, setSlotDrafts] = useState<Record<string, string>>({});
  const [slotErrors, setSlotErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setSlotDrafts((prev) => {
      const next = { ...prev };
      value.days.forEach((day) => {
        if (!(day in next)) {
          next[day] = "";
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
    variant === "profile"
      ? {
          selected: "border-indigo-200 bg-indigo-50/60",
          focus: "focus:ring-indigo-200 focus:border-indigo-600",
          checkbox: "text-indigo-600 focus:ring-indigo-200",
          button: "border-gray-200 text-gray-700 hover:bg-gray-50",
        }
      : {
          selected: "border-primary-200 bg-primary-50",
          focus: "focus:ring-primary-200",
          checkbox: "text-primary-600 focus:ring-primary-200",
          button: "border-gray-200 text-gray-700 hover:bg-gray-50",
        };

  const toggleDay = (day: string) => {
    const isSelected = value.days.includes(day);
    const nextDays = isSelected
      ? value.days.filter((item) => item !== day)
      : [...value.days, day].sort(
          (a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b)
        );

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
    setSlotErrors((prev) => ({ ...prev, [day]: "" }));
  };

  const handleAddSlot = (day: string) => {
    const draft = slotDrafts[day]?.trim();
    if (!draft) return;

    const existing = value.slotsByDay[day] || [];
    if (existing.includes(draft)) {
      setSlotDrafts((prev) => ({ ...prev, [day]: "" }));
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

    setSlotErrors((prev) => ({ ...prev, [day]: "" }));
    setSlotDrafts((prev) => ({ ...prev, [day]: "" }));
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

    setSlotErrors((prev) => ({ ...prev, [day]: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WEEKDAYS.map((day) => {
          const isSelected = value.days.includes(day);
          const slots = value.slotsByDay[day] || [];
          const validationError = isSelected
            ? validateDaySlots(day, slots)
            : null;
          const errorMessage = slotErrors[day] || validationError;
          const hasError = Boolean(errorMessage);

          return (
            <div
              key={day}
              className={`rounded-lg border p-4 ${
                hasError
                  ? "border-rose-200 bg-rose-50"
                  : isSelected
                  ? styles.selected
                  : "border-gray-200"
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
                {isSelected && (
                  <span className="text-xs text-gray-400">Selected</span>
                )}
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
                      <span className="text-xs text-gray-400">
                        No slots added yet.
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-500">
                      Add time slot
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={slotDrafts[day] || ""}
                        onChange={(e) =>
                          handleDraftChange(day, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
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
                    {errorMessage && (
                      <p className="text-xs text-rose-500">{errorMessage}</p>
                    )}
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
