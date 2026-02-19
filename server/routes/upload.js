const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const Upload = require('../models/Upload');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter — only allow GLB and GLTF
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.glb' || ext === '.gltf') {
    cb(null, true);
  } else {
    cb(new Error('Only .glb and .gltf files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// POST /api/upload
router.post('/', upload.single('model'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const uploadDoc = new Upload({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
    });

    await uploadDoc.save();

    res.json({
      success: true,
      url: `/uploads/${req.file.filename}`,
      id: uploadDoc._id,
      originalName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/upload — list all uploads
router.get('/', async (req, res) => {
  try {
    const uploads = await Upload.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, uploads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
