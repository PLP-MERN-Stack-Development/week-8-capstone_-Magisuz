const express = require('express');
const File = require('../models/File');
const Movement = require('../models/Movement');

const router = express.Router();

// Middleware to check admin role
function requireAdmin(req, res, next) {
  // In a real app, use JWT/session. Here, check custom header for demo.
  if (req.headers['x-user-role'] !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

// Register a new file (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const file = new File(req.body);
    await file.save();
    await Movement.create({ file: file._id, action: 'registered', details: 'File registered in archive.' });
    res.status(201).json(file);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List all files (any user)
router.get('/', async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a file (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const file = await File.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a file (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 