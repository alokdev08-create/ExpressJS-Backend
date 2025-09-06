const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate input
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create a new contact message
    const contactMessage = new Contact({ name, email,phone, message });
    await contactMessage.save();

    res.status(201).json({ message: "Contact message sent successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to send contact message", details: err.message });
  }
});


exports = router;
module.exports = router;        