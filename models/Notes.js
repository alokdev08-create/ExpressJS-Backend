const mongoose = require("mongoose");
const { Schema } = mongoose;

const notes = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Notes = mongoose.model("Notes", notes);
module.exports = Notes;
