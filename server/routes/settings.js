const express = require('express');
const Settings = require('../models/Settings');

const router = express.Router();

// GET /api/settings — fetch latest settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({
        backgroundColor: '#0a0a0f',
        wireframe: false,
        modelUrl: '',
        modelName: '',
      });
    }
    res.json({
      success: true,
      backgroundColor: settings.backgroundColor,
      wireframe: settings.wireframe,
      modelUrl: settings.modelUrl,
      modelName: settings.modelName,
      savedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/settings — save/update settings
router.post('/', async (req, res) => {
  try {
    const { backgroundColor, wireframe, modelUrl, modelName } = req.body;

    let settings = await Settings.findOne().sort({ updatedAt: -1 });

    if (settings) {
      // Update existing
      if (backgroundColor !== undefined) settings.backgroundColor = backgroundColor;
      if (wireframe !== undefined) settings.wireframe = wireframe;
      if (modelUrl !== undefined) settings.modelUrl = modelUrl;
      if (modelName !== undefined) settings.modelName = modelName;
      await settings.save();
    } else {
      // Create new
      settings = await Settings.create({
        backgroundColor: backgroundColor || '#0a0a0f',
        wireframe: wireframe || false,
        modelUrl: modelUrl || '',
        modelName: modelName || '',
      });
    }

    res.json({
      success: true,
      savedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
