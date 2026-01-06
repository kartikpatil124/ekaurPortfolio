const express = require('express');
const router = express.Router();
require('dotenv').config();

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Check credentials
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Set session
    req.session.isAdmin = true;
    req.session.adminEmail = email;
    req.session.loginTime = new Date().toISOString();

    // Save session explicitly and wait for it
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          success: false,
          message: 'Session error. Please try again.'
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: { email: email }
      });
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Check if admin is logged in
router.get('/check', (req, res) => {
  if (req.session && req.session.isAdmin) {
    res.json({
      isAuthenticated: true,
      email: req.session.adminEmail
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

module.exports = router;