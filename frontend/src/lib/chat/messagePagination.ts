export const toEpoch = (value: string | Date | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  if (value instanceof Date) return value.getTime();
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export const mergeOlderMessages = <T>(
  existing: T[],
  incoming: T[],
  getId: (message: T) => string,
  getTime: (message: T) => number
): T[] => {
  const seen = new Set<string>();
  existing.forEach((message) => {
    const id = getId(message);
    if (id) seen.add(id);
  });

  const merged = [...existing];
  incoming.forEach((message) => {
    const id = getId(message);
    if (id && seen.has(id)) return;
    if (id) seen.add(id);
    merged.push(message);
  });

  return merged.sort((a, b) => getTime(a) - getTime(b));
};

export const dedupeOlderAgainstLive = <T>(
  older: T[],
  live: T[],
  getId: (message: T) => string
): T[] => {
  const liveIds = new Set<string>();
  live.forEach((message) => {
    const id = getId(message);
    if (id) liveIds.add(id);
  });

  return older.filter((message) => {
    const id = getId(message);
    return !id || !liveIds.has(id);
  });
};
