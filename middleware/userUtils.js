
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

const authenticatedToken = (req, res, next) => {
  console.log("🔐 Authenticating token...");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    return res.status(403).json({ error: "Invalid access token" });
  }
};

// ✅ Export the middleware
module.exports = { authenticatedToken };
