const express = require('express');
const Movement = require('../models/Movement');
const File = require('../models/File');

const router = express.Router();

// Log a new movement for a file
router.post('/', async (req, res) => {
  try {
    const { file, action, details, destination } = req.body;
    const movement = new Movement({ file, action, details });
    await movement.save();
    // Update file's currentLocation
    if (destination) {
      await File.findByIdAndUpdate(file, { currentLocation: destination });
    }
    res.status(201).json(movement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List all movements for a file
router.get('/file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const movements = await Movement.find({ file: fileId }).sort({ timestamp: 1 });
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all movements
router.get('/', async (req, res) => {
  try {
    const movements = await Movement.find().populate('file').sort({ timestamp: -1 });
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 