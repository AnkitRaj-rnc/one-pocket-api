const Expense = require('../models/Expense');

// Get all expenses for logged in user (with optional month filter)
const getAllExpenses = async (req, res) => {
  try {
    const { month } = req.query;

    // Build query - exclude reimbursed expenses
    const query = {
      userId: req.user.id,
      $or: [
        { reimbursed: false },
        { reimbursed: { $exists: false } }
      ]
    };

    // If month parameter is provided, filter by month
    if (month) {
      // Validate month format (YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid month format. Use YYYY-MM'
        });
      }

      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Get expenses with optional month filter
    const expenses = await Expense.find(query).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new expense
const createExpense = async (req, res) => {
  try {
    const { amount, reason, date, paymentMethod, note, reimbursable } = req.body;

    // Validate required fields
    if (!amount || !reason || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, reason, and date'
      });
    }

    // Validate paymentMethod if provided
    if (paymentMethod && !['cash', 'credit_card', 'upi'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be "cash", "credit_card", or "upi"'
      });
    }

    // Automatically add userId from JWT token
    const expense = await Expense.create({
      userId: req.user.id,
      amount,
      reason,
      date,
      paymentMethod: paymentMethod || 'upi',
      note: note || '',
      reimbursable: reimbursable !== undefined ? reimbursable : false
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search expenses by note
const searchExpensesByNote = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    // Search expenses where note contains the query string (case-insensitive)
    const expenses = await Expense.find({
      userId: req.user.id,
      note: { $regex: query, $options: 'i' }
    }).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark expense as reimbursed
const reimburseExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Find expense
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check if expense belongs to logged in user
    if (expense.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reimburse this expense'
      });
    }

    // Check if already reimbursed
    if (expense.reimbursed) {
      return res.status(400).json({
        success: false,
        message: 'Expense already marked as reimbursed'
      });
    }

    // Mark as reimbursed
    expense.reimbursed = true;
    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense marked as reimbursed',
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Find expense
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check if expense belongs to logged in user
    if (expense.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense'
      });
    }

    // Delete expense
    await Expense.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllExpenses,
  createExpense,
  searchExpensesByNote,
  reimburseExpense,
  deleteExpense
};
