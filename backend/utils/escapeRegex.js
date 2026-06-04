export const escapeRegex = (value) =>
  String(value == null ? "" : value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const safeSearchRegex = (value, flags = "i") =>
  new RegExp(escapeRegex(value).slice(0, 200), flags);
