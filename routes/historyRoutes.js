const express = require('express');
const router = express.Router();
const { getMonths, getMonthlySummary } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

// All routes are protected - require JWT token
router.use(protect);

// GET /api/history/months - Get list of months with expense data
router.get('/months', getMonths);

// GET /api/history/summary - Get monthly summary
router.get('/summary', getMonthlySummary);

module.exports = router;
