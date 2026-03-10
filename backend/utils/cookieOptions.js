const getCookieSecurityConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const configuredSameSite = (process.env.COOKIE_SAME_SITE || "").toLowerCase();

  let sameSite = configuredSameSite;
  if (!["lax", "strict", "none"].includes(sameSite)) {
    sameSite = isProduction ? "none" : "lax";
  }

  // Browsers require Secure=true when SameSite=None.
  const secure = sameSite === "none" ? true : isProduction;

  const domain = process.env.COOKIE_DOMAIN || undefined;

  return { sameSite, secure, domain };
};

export const getCookieOptions = (maxAge, { httpOnly = true } = {}) => {
  const { sameSite, secure, domain } = getCookieSecurityConfig();

  return {
    httpOnly,
    secure,
    sameSite,
    maxAge,
    path: "/",
    ...(domain ? { domain } : {}),
  };
};

export const getCookieClearOptions = ({ httpOnly = true } = {}) => {
  const { sameSite, secure, domain } = getCookieSecurityConfig();

  return {
    httpOnly,
    secure,
    sameSite,
    path: "/",
    ...(domain ? { domain } : {}),
  };
};
