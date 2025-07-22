// backend/models/Otp.js

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 400  // ⏱️ Document auto-deletes after 400 seconds = 6.5 mins
  }
});

module.exports = mongoose.model('Otp', otpSchema);
