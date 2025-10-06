const express = require('express');
const router = express.Router();
const { getAllBudgets, createBudget, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

// All routes are protected - require JWT token
router.use(protect);

// GET /api/budgets - Get all budgets for logged in user
router.get('/', getAllBudgets);

// POST /api/budgets - Create new budget
router.post('/', createBudget);

// PUT /api/budgets/:id - Update budget
router.put('/:id', updateBudget);

// DELETE /api/budgets/:id - Delete budget
router.delete('/:id', deleteBudget);

module.exports = router;
