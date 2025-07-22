const pdfParse = require('pdf-parse');
const multer = require('multer');
const storage = require('../services/cloudinaryStorage');
const upload = multer({ storage });
const fetch = require('node-fetch'); // needed to stream from Cloudinary URL

// Middleware for route
exports.upload = upload.single('pdf');

// Controller Logic
exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // 📥 Fetch file buffer from Cloudinary URL (req.file.path === secure_url)
    const response = await fetch(req.file.path);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 📄 Extract page count
    const pdfData = await pdfParse(buffer);
    const pageCount = pdfData.numpages;
    const price = pageCount * 5;

    // ✅ Send metadata + Cloudinary URL
    return res.status(200).json({
      success: true,
      fileUrl: req.file.path, // secure_url from Cloudinary
      pageCount,
      price,
      originalName: req.file.originalname
    });

  } catch (err) {
    console.error("❌ Upload Error:", err);
    return res.status(500).json({ success: false, message: 'File processing failed' });
  }
};
