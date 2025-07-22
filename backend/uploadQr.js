// uploadQr.js

const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const path = require("path");

// 🔧 Configure Cloudinary from .env
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// 🔁 Upload QR file
const qrPath = path.resolve("C:/Users/deboj/Downloads/qrcode_228571616_ae4c73d2b7d94cf724b29e9208b4d4e1.png");

cloudinary.uploader.upload(qrPath, {
  folder: "handwritten/qr",
  public_id: "receive-payments",
  overwrite: true
})
.then(result => {
  console.log("✅ UPI QR uploaded successfully.");
  console.log("📎 URL:", result.secure_url);
})
.catch(error => {
  console.error("❌ Upload failed:", error.message);
});
