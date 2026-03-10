const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

// Direct backend origin — used only for full-page OAuth redirects (e.g. Google auth)
export const apiOrigin = trimTrailingSlash(rawApiUrl.replace(/\/api\/?$/i, ""));

// Relative base URL for all XHR/fetch API calls.
// In production this routes through the Next.js rewrite proxy (/api/* → Render backend),
// making cookies same-site (Vercel domain) and eliminating cross-browser cookie-blocking.
export const apiBaseUrl = "/api";
