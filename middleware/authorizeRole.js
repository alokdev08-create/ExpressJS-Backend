const User = require("../models/User");

const authorizeRole = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate("role");
      if (!user || !user.role) {
        return res.status(403).json({ error: "Access denied: No role assigned" });
      }

      const hasPermission = user.role.permissions.includes(requiredPermission);
      if (!hasPermission) {
        return res.status(403).json({ error: "Access denied: Insufficient permissions" });
      }

      next();
    } catch (err) {
      console.error("Authorization error:", err.message);
      res.status(500).json({ error: "Authorization failed" });
    }
  };
};

module.exports = authorizeRole;
