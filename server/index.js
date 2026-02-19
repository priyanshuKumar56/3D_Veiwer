const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── CORS ──────────────────────────────────────
// Accept CLIENT_URL as a comma-separated list for flexibility
const allowedOrigins = (process.env.CLIENT_URL || 'https://3-d-veiwer-hy6m.vercel.app')
  .split(',')
  .map(s => s.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files statically with CORS headers
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  },
}));

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Max size is 50MB.' });
  }
  if (err.message && err.message.includes('Only .glb and .gltf')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({ success: false, message: 'CORS: origin not allowed' });
  }
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
