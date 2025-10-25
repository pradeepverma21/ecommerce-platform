const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;