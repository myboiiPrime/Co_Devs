const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile
} = require('../controllers/authController');

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   POST /api/auth/logout
router.post('/logout', auth, logout);

// @route   GET /api/auth/profile
router.get('/profile', auth, getProfile);

// @route   PUT /api/auth/profile
router.put('/profile', auth, updateProfile);

module.exports = router;