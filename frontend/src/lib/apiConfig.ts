const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const origin = trimTrailingSlash(rawApiUrl.replace(/\/api\/?$/i, ""));

// Backend origin for non-API routes like OAuth (/auth/google)
export const apiOrigin = origin;

// API root used by REST calls
export const apiBaseUrl = `${origin}/api`;
