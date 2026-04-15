const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (error) {
      return res.status(403).json({ message: "Forbidden" });
    }
  };
};

module.exports = roleMiddleware;