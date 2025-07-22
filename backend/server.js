// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const paymentRoutes = require('./routes/payment');
const otpRoutes = require('./routes/otp');
const webhookRoutes = require('./routes/webhook'); // ✅ Razorpay Webhook route
const adminRoutes = require("./routes/admin"); // ✅ Admin Routes
const app = express();

// ✅ Middleware Order is Important for Webhook
app.use('/api/webhook/razorpay', express.raw({ type: 'application/json' })); // 👈 raw body BEFORE express.json
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// 🔗 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/webhook', webhookRoutes); // 💡 includes /razorpay in router
app.use("/api/admin", adminRoutes); // ✅ Admin Routes
app.use("/api/qr", qrRoutes); // ✅ QR Upload and Fetch Routes
// ☁️ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// 📁 Ensure Uploads Directory (Only needed for fallback/local uploads)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('📁 Created uploads directory');
}

// 🧪 .env Validation (Basic Key Check)
['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'JWT_SECRET', 'CLOUDINARY_API_KEY'].forEach(key => {
  if (!process.env[key]) console.warn(`⚠️  Missing ENV Key: ${key}`);
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
