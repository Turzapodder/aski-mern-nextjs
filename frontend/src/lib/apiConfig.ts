const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const origin = trimTrailingSlash(rawApiUrl.replace(/\/api\/?$/i, ""));

// Final API base
export const apiOrigin = `${origin}/api`;

