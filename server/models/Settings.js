const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  backgroundColor: {
    type: String,
    default: '#0a0a0f',
  },
  wireframe: {
    type: Boolean,
    default: false,
  },
  modelUrl: {
    type: String,
    default: '',
  },
  modelName: {
    type: String,
    default: '',
  },
  lightColor: {
    type: String,
    default: '#ffffff',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Settings', settingsSchema);
