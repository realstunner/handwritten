// backend/routes/otp.js
const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

// Send OTP to email
router.post('/send', otpController.sendOtpToEmail);

// Verify OTP
router.post('/verify', otpController.verifyOtp);

module.exports = router;
