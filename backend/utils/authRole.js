const LOGIN_ROLE_ALIASES = {
  student: "user",
};

export const LOGIN_ROLES = ["user", "tutor", "admin"];

export const normalizeLoginRole = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  const aliased = LOGIN_ROLE_ALIASES[normalized] || normalized;
  return LOGIN_ROLES.includes(aliased) ? aliased : null;
};

export const normalizeUserRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((role) => (typeof role === "string" ? role.trim().toLowerCase() : ""))
    .filter(Boolean);
};

export const canUserUseLoginRole = (roles, loginRole) => {
  const requestedRole = normalizeLoginRole(loginRole);
  if (!requestedRole) return false;

  const normalizedRoles = normalizeUserRoles(roles);
  const isAdmin = normalizedRoles.includes("admin");

  // Keep admin access isolated to the admin entrypoint.
  if (isAdmin) {
    return requestedRole === "admin";
  }

  if (requestedRole === "admin") return false;
  if (requestedRole === "tutor") return normalizedRoles.includes("tutor");

  return normalizedRoles.includes("user") || normalizedRoles.includes("student");
};

export const getRoleMismatchMessage = (requestedRole) => {
  if (requestedRole === "admin") {
    return "You do not have admin access for this login entrypoint";
  }
  if (requestedRole === "tutor") {
    return "You do not have tutor access for this login entrypoint";
  }
  return "You do not have user access for this login entrypoint";
};
