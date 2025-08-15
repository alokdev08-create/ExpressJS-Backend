const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticatedToken } = require("../middleware/userUtils");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 📝 POST /register
router.post("/register", upload.single("photo"), async (req, res) => {
  try {
    const { name, email, password, roleName, mobile } = req.body;
    const photo = req.file ? req.file.filename : "default.jpg";

    if (!name || !email || !password || !roleName || !mobile) {
      return res.status(400).json({ error: "All fields including roleName and mobile are required" });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ error: "Invalid mobile number" });
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
      role: role._id,
      mobile,
      photo
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔑 POST /login
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

// 👤 GET /fetchUserDetails
router.get("/fetchUserDetails", authenticatedToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("role", "name permissions");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User details fetched successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// ✏️ PUT /updateProfile
router.put("/updateProfile", authenticatedToken, upload.single("photo"), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, mobile } = req.body;
    const newPhoto = req.file ? req.file.filename : null;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name || user.name;
    user.mobile = mobile || user.mobile;

    if (newPhoto) {
      // Optional: delete old photo if not default
      if (user.photo && user.photo !== "default.jpg") {
        const oldPath = path.join(__dirname, "..", "uploads", user.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.photo = newPhoto;
    }

    await user.save();
    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("role", "name permissions");

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// 🗑️ DELETE /deleteProfile
router.delete("/deleteProfile", authenticatedToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Optional: delete photo file
    if (user.photo && user.photo !== "default.jpg") {
      const photoPath = path.join(__dirname, "..", "uploads", user.photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
