export const escapeRegex = (value) =>
  String(value == null ? "" : value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const safeSearchRegex = (value, flags = "i") =>
  new RegExp(escapeRegex(String(value == null ? "" : value).slice(0, 200)), flags);
