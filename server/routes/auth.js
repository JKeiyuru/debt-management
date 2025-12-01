const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUser
} = require('../controllers/authController');
const { protect, authorize, checkPermission } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// Admin routes
router.get('/users', protect, checkPermission('canManageUsers'), getAllUsers);
router.put('/users/:id', protect, checkPermission('canManageUsers'), updateUser);

module.exports = router;