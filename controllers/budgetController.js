const Budget = require('../models/Budget');

// Get all budgets for logged in user (with optional month filter)
const getAllBudgets = async (req, res) => {
  try {
    const { month } = req.query;

    // Build query
    const query = { userId: req.user.id };

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

      query.month = month;
    }

    const budgets = await Budget.find(query).sort({ createdAt: -1 });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new budget
const createBudget = async (req, res) => {
  try {
    const { category, amount, month } = req.body;

    // Validate required fields
    if (!category || !amount || !month) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, amount, and month'
      });
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Use YYYY-MM'
      });
    }

    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // Check if budget already exists for this user, category, and month
    const existingBudget = await Budget.findOne({
      userId: req.user.id,
      category,
      month
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and month'
      });
    }

    // Create budget with userId from JWT token
    const budget = await Budget.create({
      userId: req.user.id,
      category,
      amount,
      month
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update budget
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, month } = req.body;

    // Find budget and check ownership
    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget belongs to logged in user
    if (budget.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this budget'
      });
    }

    // Validate month format if provided
    if (month) {
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid month format. Use YYYY-MM'
        });
      }
    }

    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // Check for duplicate if category or month is being changed
    if (category || month) {
      const checkCategory = category || budget.category;
      const checkMonth = month || budget.month;

      const existingBudget = await Budget.findOne({
        _id: { $ne: id },
        userId: req.user.id,
        category: checkCategory,
        month: checkMonth
      });

      if (existingBudget) {
        return res.status(400).json({
          success: false,
          message: 'Budget already exists for this category and month'
        });
      }
    }

    // Update budget
    if (category) budget.category = category;
    if (amount) budget.amount = amount;
    if (month) budget.month = month;

    await budget.save();

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete budget
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    // Find budget and check ownership
    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget belongs to logged in user
    if (budget.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this budget'
      });
    }

    // Delete budget
    await Budget.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
