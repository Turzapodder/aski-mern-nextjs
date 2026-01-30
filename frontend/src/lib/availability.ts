export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOT_REGEX = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/;

const parseTimeSlot = (slot: string) => {
  const match = slot.match(TIME_SLOT_REGEX);
  if (!match) return null;

  const startHour = Number(match[1]);
  const startMinute = Number(match[2]);
  const endHour = Number(match[3]);
  const endMinute = Number(match[4]);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    return null;
  }

  if (
    startHour > 23 ||
    startMinute > 59 ||
    endHour > 23 ||
    endMinute > 59
  ) {
    return null;
  }

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  if (end <= start) return null;

  return { start, end };
};

export const isValidTimeSlot = (slot: string) => Boolean(parseTimeSlot(slot));

export interface AvailabilityValue {
  days: string[];
  slotsByDay: Record<string, string[]>;
}

const normalizeSlots = (slots: unknown) => {
  if (!Array.isArray(slots)) return [];
  const unique = new Set<string>();
  slots.forEach((slot) => {
    if (typeof slot === "string") {
      const trimmed = slot.trim();
      if (trimmed) unique.add(trimmed);
    }
  });
  return Array.from(unique);
};

export const buildAvailabilityValue = (
  availableDays: string[] = [],
  availableTimeSlots: Array<string | { day?: string; slots?: string[] }> = []
): AvailabilityValue => {
  const slotsByDay: Record<string, string[]> = {};
  const daySet = new Set<string>();

  availableTimeSlots.forEach((entry) => {
    if (typeof entry === "string") {
      return;
    }
    const day = typeof entry?.day === "string" ? entry.day.trim() : "";
    if (!day) return;
    const slots = normalizeSlots(entry?.slots);
    daySet.add(day);
    slotsByDay[day] = slots;
  });

  availableDays.forEach((day) => {
    const trimmed = typeof day === "string" ? day.trim() : "";
    if (!trimmed) return;
    daySet.add(trimmed);
    if (!slotsByDay[trimmed]) {
      slotsByDay[trimmed] = [];
    }
  });

  const orderedDays = WEEKDAYS.filter((day) => daySet.has(day));
  const extraDays = Array.from(daySet).filter(
    (day) => !WEEKDAYS.includes(day)
  );

  return {
    days: [...orderedDays, ...extraDays],
    slotsByDay,
  };
};

export const validateDaySlots = (day: string, slots: string[]) => {
  if (!WEEKDAYS.includes(day)) {
    return `Invalid day name in time slots: ${day}`;
  }

  if (slots.length > 10) {
    return `Maximum 10 slots per day allowed for ${day}`;
  }

  const parsedSlots = slots.map((slot) => {
    if (typeof slot !== "string") return null;
    const trimmed = slot.trim();
    if (!trimmed) return null;
    const parsed = parseTimeSlot(trimmed);
    if (!parsed) {
      return { error: `Invalid time slot format for ${day}: ${trimmed}` };
    }
    return { ...parsed, raw: trimmed };
  });

  for (const parsed of parsedSlots) {
    if (!parsed) {
      return `Invalid time slot format for ${day}`;
    }
    if ("error" in parsed && parsed.error) {
      return parsed.error;
    }
  }

  const ranges = parsedSlots
    .filter((slot) => slot && !("error" in slot))
    .map((slot) => ({ start: (slot as any).start, end: (slot as any).end }))
    .sort((a, b) => a.start - b.start);

  for (let i = 1; i < ranges.length; i += 1) {
    if (ranges[i].start < ranges[i - 1].end) {
      return `Time slots overlap for ${day}`;
    }
  }

  return null;
};
