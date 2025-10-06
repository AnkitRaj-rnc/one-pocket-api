const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// Get list of months that have expense data
const getMonths = async (req, res) => {
  try {
    // Get all expenses for the user
    const expenses = await Expense.find({ userId: req.user.id });

    if (expenses.length === 0) {
      return res.status(200).json([]);
    }

    // Extract unique months in YYYY-MM format
    const monthsSet = new Set();
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsSet.add(yearMonth);
    });

    // Convert to array and sort from most recent to oldest
    const months = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));

    res.status(200).json(months);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get monthly summary with category breakdown and budget comparisons
const getMonthlySummary = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month in YYYY-MM format'
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

    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

    // Get expenses for the month
    const expenses = await Expense.find({
      userId: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Calculate total spent
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate category breakdown
    const categoryMap = {};
    expenses.forEach(expense => {
      if (!categoryMap[expense.reason]) {
        categoryMap[expense.reason] = 0;
      }
      categoryMap[expense.reason] += expense.amount;
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0 ? parseFloat(((amount / totalSpent) * 100).toFixed(1)) : 0
    }));

    // Get budgets for the specific month only
    const budgets = await Budget.find({
      userId: req.user.id,
      month: month
    });

    // Calculate budget comparisons
    const budgetComparisons = budgets.map(budget => {
      const actualSpent = categoryMap[budget.category] || 0;
      const difference = budget.amount - actualSpent;
      const percentageUsed = budget.amount > 0 ? parseFloat(((actualSpent / budget.amount) * 100).toFixed(1)) : 0;

      return {
        category: budget.category,
        budgetAmount: budget.amount,
        actualSpent,
        difference,
        percentageUsed
      };
    });

    res.status(200).json({
      month,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      categoryBreakdown,
      budgetComparisons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getMonths,
  getMonthlySummary
};
