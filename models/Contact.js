const mongoose = require("mongoose");
const { Schema } = mongoose;

const contact = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /.+\@.+\..+/,
  },

  phone: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 15,
  },
  message: {
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

const Contact = mongoose.model("Contact", contact);
module.exports = Contact;
