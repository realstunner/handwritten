const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { verifyToken } = require('../middlewares/authMiddleware');

// 🔐 Cloudinary-based secured PDF upload endpoint
router.post('/pdf', verifyToken, uploadController.upload, uploadController.uploadPDF);

module.exports = router;
