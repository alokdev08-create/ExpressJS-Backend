const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Role = require("../models/Role"); // ✅ Import Role model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
const { authenticatedToken } = require("../middleware/userUtils");

// 📝 POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;

    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ error: "All fields including roleName are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({ error: "Invalid role name" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role._id, // ✅ Assign role ID
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔑 POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = { id: user._id };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👤 GET /api/auth/fetchUserDetails
router.get("/fetchUserDetails", authenticatedToken, async (req, res) => {
  console.log("📥 Get user function called");

  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("role", "name permissions"); // ✅ Include role info

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error.message);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

module.exports = router;
