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

export default verifyAdmin;
