// backend/controllers/otpController.js
const Otp = require('../models/Otp');
const { sendOTP } = require('../services/otp');

/**
 * Sends a new OTP to a user's email
 */
exports.sendOtpToEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  try {
    const otpCode = await sendOTP(email);

    await Otp.deleteMany({ email }); // Remove previous OTPs

    const otpEntry = new Otp({ email, otp: otpCode });
    await otpEntry.save();

    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

/**
 * Verifies a submitted OTP
 */
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await Otp.deleteMany({ email }); // OTP used → clean up

    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
};

