const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadQR, getCurrentQR } = require("../controllers/qrController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Local temp storage setup before Cloudinary upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../tempUploads/qr");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    if (isImage) cb(null, true);
    else cb(new Error("Only image files allowed for QR"), false);
  }
});

// 🔐 POST: Upload QR (admin-protected)
router.post("/upload", verifyToken, upload.single("qr"), uploadQR);

// 🔓 GET: Fetch latest QR (for frontend)
router.get("/latest", getCurrentQR);

module.exports = router;
