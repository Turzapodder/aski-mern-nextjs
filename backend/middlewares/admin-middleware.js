const verifyAdmin = async (req, res, next) => {
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];

  if (!roles.includes("admin")) {
    return res.status(403).json({
      status: "failed",
      message: "Access denied",
    });
  }

  return next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.adminRole === "super_admin") {
    return next();
  }
  return res.status(403).json({
    status: "failed",
    message: "Super admin access required",
  });
};

export const requirePrivilege = (privilege) => (req, res, next) => {
  if (req.user?.adminRole === "super_admin" || req.user?.adminPrivileges?.[privilege]) {
    return next();
  }
  return res.status(403).json({
    status: "failed",
    message: "You do not have permission to perform this action",
  });
};

export default verifyAdmin;
