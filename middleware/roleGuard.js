const User = require("../models/User");
const routePermissions = require("../config/routePermissions");

const roleGuard = async (req, res, next) => {
  try {
    const fullPath = req.baseUrl + req.path; // e.g. "/api/notes/updateNotes/123"
    const matchedRoute = Object.keys(routePermissions).find((route) =>
      fullPath.startsWith(route)
    );

    if (!matchedRoute) return next(); // No permission required

    const requiredPermission = routePermissions[matchedRoute];

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
    console.error("Role guard error:", err.message);
    res.status(500).json({ error: "Authorization failed" });
  }
};

module.exports = roleGuard;
