const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const rawApiOrigin =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

export const apiOrigin = trimTrailingSlash(rawApiOrigin);

export const apiBaseUrl = /\/api$/i.test(apiOrigin)
  ? apiOrigin
  : `${apiOrigin}/api`;
