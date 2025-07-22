// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const OTP_STORE = new Map(); // Temporary in-memory store for OTP

// 🚀 Register with OTP (Step 1 - Send OTP)
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit

  // Setup mail
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,  // in .env
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Handwritten OTP',
    text: `Your OTP for Handwritten signup is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    OTP_STORE.set(email, otp);
    setTimeout(() => OTP_STORE.delete(email), 6.5 * 60 * 1000); // expire in 5 min
    res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Email failed', error: err.message });
  }
};

// ✅ Register User (Step 2 - Validate OTP and save)
exports.register = async (req, res) => {
  const { username, email, password, phone, signature, otp } = req.body;

  if (!OTP_STORE.get(email) || OTP_STORE.get(email).toString() !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      signature,
    });

    await newUser.save();
    OTP_STORE.delete(email);

    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration error', error: err.message });
  }
};

// 🔐 Login + JWT
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        signature: user.signature
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    

    res.json({ success: true, token, user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
};
