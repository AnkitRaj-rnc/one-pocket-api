const express = require('express');
const router = express.Router();
const { getAllExpenses, createExpense, searchExpensesByNote } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

// All routes are protected - require JWT token
router.use(protect);

// GET /api/expenses/search - Search expenses by note (must be before '/' route)
router.get('/search', searchExpensesByNote);

// GET /api/expenses - Get all expenses for logged in user
router.get('/', getAllExpenses);

// POST /api/expenses - Create new expense for logged in user
router.post('/', createExpense);

module.exports = router;
