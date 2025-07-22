// backend/services/otp.js
const nodemailer = require('nodemailer');

// Random 6-digit OTP generator
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Email sending function
async function sendOTP(email) {
  const otp = generateOTP();

  const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'mailgun', 'sendgrid', etc.
    auth: {
      user: process.env.EMAIL_USER, // from .env
      pass: process.env.EMAIL_PASS, // from .env
    },
  });

  const mailOptions = {
    from: `"Handwritten Auth" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code for Handwritten',
    html: `<h2>🔐 OTP Verification</h2><p>Your OTP code is: <strong>${otp}</strong></p><p>This OTP is valid for a few minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
  return otp;
}

module.exports = { sendOTP };
