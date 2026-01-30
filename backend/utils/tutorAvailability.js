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

const parseTimeSlot = (slot) => {
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

export const normalizeDayList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((day) => (typeof day === "string" ? day.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((day) => day.trim())
      .filter(Boolean);
  }

  return [];
};

export const normalizeTimeSlotEntries = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const day = typeof entry.day === "string" ? entry.day.trim() : "";
      const slots = Array.isArray(entry.slots)
        ? entry.slots
            .map((slot) => (typeof slot === "string" ? slot.trim() : ""))
            .filter(Boolean)
        : [];

      if (!day) return null;

      return { day, slots };
    })
    .filter(Boolean);
};

export const buildAvailabilityPayload = (
  availableDays,
  availableTimeSlots
) => {
  const normalizedDays = normalizeDayList(availableDays);
  const normalizedSlots = normalizeTimeSlotEntries(availableTimeSlots);

  const slotMap = new Map();
  normalizedSlots.forEach((entry) => {
    slotMap.set(entry.day, entry.slots);
  });

  const derivedDays = Array.from(slotMap.keys());
  const finalDays = normalizedDays.length > 0 ? normalizedDays : derivedDays;

  finalDays.forEach((day) => {
    if (!slotMap.has(day)) {
      slotMap.set(day, []);
    }
  });

  return {
    availableDays: finalDays,
    availableTimeSlots: Array.from(slotMap.entries()).map(([day, slots]) => ({
      day,
      slots,
    })),
  };
};

export const validateAvailability = (availableDays, availableTimeSlots) => {
  if (!Array.isArray(availableDays)) {
    return "availableDays must be an array of weekday names";
  }

  const normalizedDays = availableDays.map((day) =>
    typeof day === "string" ? day.trim() : ""
  );

  for (const day of normalizedDays) {
    if (!WEEKDAYS.includes(day)) {
      return `Invalid day name: ${day}`;
    }
  }

  if (!Array.isArray(availableTimeSlots)) {
    return "availableTimeSlots must be an array of day/slot objects";
  }

  const daySlotMap = new Map();

  for (const entry of availableTimeSlots) {
    if (!entry || typeof entry !== "object") {
      return "Each availableTimeSlots entry must be an object";
    }

    const day = typeof entry.day === "string" ? entry.day.trim() : "";
    const slots = Array.isArray(entry.slots) ? entry.slots : [];

    if (!WEEKDAYS.includes(day)) {
      return `Invalid day name in time slots: ${day}`;
    }

    if (slots.length > 10) {
      return `Maximum 10 slots per day allowed for ${day}`;
    }

    const parsedSlots = slots.map((slot) => {
      if (typeof slot !== "string") return null;
      const trimmed = slot.trim();
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
      if (parsed.error) {
        return parsed.error;
      }
    }

    const ranges = parsedSlots
      .filter((slot) => slot && !slot.error)
      .map((slot) => ({ start: slot.start, end: slot.end }))
      .sort((a, b) => a.start - b.start);

    for (let i = 1; i < ranges.length; i += 1) {
      if (ranges[i].start < ranges[i - 1].end) {
        return `Time slots overlap for ${day}`;
      }
    }

    daySlotMap.set(day, slots.map((slot) => slot.trim()));
  }

  for (const day of normalizedDays) {
    if (!daySlotMap.has(day)) {
      daySlotMap.set(day, []);
    }
  }

  return null;
};
