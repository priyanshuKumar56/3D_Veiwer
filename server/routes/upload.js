const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const Upload = require('../models/Upload');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate UUID but preserve original extension
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

// POST /api/upload — Handle new uploads with duplicate check
router.post('/', upload.single('model'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Check for duplicate by original filename
    // If it exists, we replace the old file content with new, updating the record
    const existing = await Upload.findOne({ originalName: req.file.originalname });

    if (existing) {
      // 1. Delete the OLD file from disk if it's different from the new one
      // (Multer has already written the NEW file to disk at req.file.path)
      const oldPath = path.join(uploadDir, existing.storedName);
      
      // Safety check: don't delete if somehow filenames collided (unlikely with UUID)
      if (existing.storedName !== req.file.filename && fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
          console.log(`Replaced duplicate file: deleted ${existing.storedName}`);
        } catch (err) {
          console.error('Error deleting old duplicate file:', err);
        }
      }

      // 2. Update existing record
      existing.storedName = req.file.filename;
      existing.filePath = `/uploads/${req.file.filename}`;
      existing.fileSize = req.file.size;
      // Mongoose updates `updatedAt` automatically
      await existing.save();

      return res.json({
        success: true,
        message: 'File updated (duplicate replaced)',
        url: existing.filePath,
        id: existing._id,
        originalName: existing.originalName,
        fileSize: existing.fileSize,
      });
    }

    // If not duplicate, create new record
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
    // Be nice and try to cleanup the uploaded file if DB save failed
    if (req.file && req.file.path) {
       try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/upload — List uploads with filesystem sync
router.get('/', async (req, res) => {
  try {
    // 1. Fetch all records sorted by newest
    const uploads = await Upload.find().sort({ updatedAt: -1 });

    const validUploads = [];
    const idsToDelete = [];

    // 2. Verify existence on disk
    for (const doc of uploads) {
      const fullPath = path.join(uploadDir, doc.storedName);
      if (fs.existsSync(fullPath)) {
        validUploads.push(doc);
      } else {
        // Mark for deletion from DB
        idsToDelete.push(doc._id);
      }
    }

    // 3. Cleanup DB if needed
    if (idsToDelete.length > 0) {
      await Upload.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`Sync: Removed ${idsToDelete.length} missing files from DB`);
    }

    // 4. Return valid list (limit to 20 for UI)
    res.json({ success: true, uploads: validUploads.slice(0, 20) });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
