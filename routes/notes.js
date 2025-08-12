const express = require("express");
const router = express.Router();
const Note = require("../models/Notes");
const { authenticatedToken } = require("../middleware/userUtils");
const User = require("../models/User");
const authorizeRole = require("../middleware/authorizeRole");
// GET /api/notes
router.get("/", authenticatedToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const notes = await Note.find({ user: user._id }).sort({ date: -1 }); // Latest first
    console.log("Response from DB:", notes);
    res.json({ message: "Notes fetched successfully", notes });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch notes", details: err.message });
  }
});

// GET /api/notes/:id
router.get("/:id", authenticatedToken, async (req, res) => {
  try {
    console.log("Note id:", req.params.id);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const note = await Note.findOne({ _id: req.params.id, user: user._id });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    console.log("Response from DB:", note);
    res.json({ message: "Note fetched successfully", note });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch note", details: err.message });
  }
});

// POST /api/notes
router.post("/", authenticatedToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { title, content } = req.body;
    const note = new Note({ title, content, user: user._id });
    await note.save();

    res.status(201).json({ message: "Note created successfully", note });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to create note", details: err.message });
  }
});

router.put("/updateNotes/:id", authenticatedToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: user._id },
      { title, content },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    console.log("Response from DB:", note);
    res.json({ message: "Note updated successfully", note });
  } catch (error) {
    console.error("❌ Error updating note:", error.message);
    res.status(500).json({ error: "Failed to update note" });
  }
});

router.delete("/deleteNotes/:id", authenticatedToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: user._id,
    });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete note", details: err.message });
  }
});

module.exports = router;
