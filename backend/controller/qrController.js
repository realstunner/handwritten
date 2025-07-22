const cloudinary = require("../services/cloudinary");
const QR = require("../models/QR"); // Optional: Only if you store QR history

// Upload QR to Cloudinary and optionally store in DB
exports.uploadQR = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "handwritten/qr",
      resource_type: "image",
      public_id: `qr_${Date.now()}`,
      overwrite: true,
    });

    // Optional DB save
    const newQR = new QR({ url: result.secure_url });
    await newQR.save();

    return res.status(200).json({
      success: true,
      message: "QR uploaded successfully.",
      qrUrl: result.secure_url,
    });

  } catch (err) {
    console.error("QR Upload Error:", err);
    return res.status(500).json({ success: false, message: "Server error during QR upload." });
  }
};

// Get latest uploaded QR
exports.getLatestQR = async (req, res) => {
  try {
    const latestQR = await QR.findOne().sort({ uploadedAt: -1 }).exec();

    if (!latestQR) {
      return res.status(404).json({ success: false, message: "No QR found." });
    }

    return res.status(200).json({
      success: true,
      qrUrl: latestQR.url,
    });

  } catch (err) {
    console.error("Fetch QR Error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching QR." });
  }
};
