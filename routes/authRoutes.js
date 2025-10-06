const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// GET /api/auth/me - Get current user (protected route)
router.get('/me', protect, getMe);

// POST /api/auth/logout - Logout user (protected route)
router.post('/logout', protect, logout);

module.exports = router;
