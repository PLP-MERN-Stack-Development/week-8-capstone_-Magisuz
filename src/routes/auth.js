const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    
    // Update last login time and increment login count
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();
    
    res.json({ message: 'Login successful', user: { email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get user profile (by email for demo)
router.post('/profile', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ 
      name: user.name, 
      email: user.email, 
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      loginCount: user.loginCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Change password (by email for demo)
router.post('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Old password is incorrect.' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Admin registration endpoint (for user management)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role === 'admin' ? 'admin' : 'user' 
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update user role (admin only)
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Valid role (user or admin) is required.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ message: 'User role updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Prevent admin from deleting themselves
    const currentUserEmail = req.headers['x-user-email'];
    if (currentUserEmail && user.email === currentUserEmail) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router; 