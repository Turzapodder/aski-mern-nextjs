const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const configuredApiUrl = trimTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL ||
    ""
);

const developmentApiOrigin = "http://localhost:8000";

export const apiOrigin = configuredApiUrl
  ? trimTrailingSlash(configuredApiUrl.replace(/\/api\/?$/i, ""))
  : developmentApiOrigin;

export const apiBaseUrl = configuredApiUrl
  ? /\/api\/?$/i.test(configuredApiUrl)
    ? configuredApiUrl
    : `${apiOrigin}/api`
  : `${developmentApiOrigin}/api`;
