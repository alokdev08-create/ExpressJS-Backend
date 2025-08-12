const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  }, // e.g. 'admin', 'editor', 'viewer'
  permissions: [{ type: String }],
  // e.g. ['updateNote', 'deleteNote']
});

module.exports = mongoose.model("Role", roleSchema);
