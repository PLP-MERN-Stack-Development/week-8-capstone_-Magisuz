const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  action: {
    type: String,
    enum: ['registered', 'moved', 'retrieved', 'destroyed'],
    required: true,
  },
  details: { type: String }, // Optional details about the movement
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Movement', movementSchema); 