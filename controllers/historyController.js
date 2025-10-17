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

    // Get expenses for the month (exclude reimbursable and reimbursed expenses)
    const expenses = await Expense.find({
      userId: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      },
      $or: [
        { reimbursable: false },
        { reimbursable: { $exists: false } }
      ],
      $and: [
        {
          $or: [
            { reimbursed: false },
            { reimbursed: { $exists: false } }
          ]
        }
      ]
    });

    // Get reimbursable expenses for the month
    const reimbursableExpenses = await Expense.find({
      userId: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      },
      reimbursable: true
    });

    // Calculate total spent
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate total reimbursable amount
    const totalReimbursable = reimbursableExpenses.reduce((sum, expense) => sum + expense.amount, 0);

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
      totalReimbursable: parseFloat(totalReimbursable.toFixed(2)),
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

// Get monthly comparison for last N months
const getMonthlyComparison = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const monthsCount = parseInt(months);

    if (isNaN(monthsCount) || monthsCount < 1 || monthsCount > 24) {
      return res.status(400).json({
        success: false,
        message: 'Months parameter must be between 1 and 24'
      });
    }

    // Generate array of last N months in YYYY-MM format
    const monthsList = [];
    const today = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsList.push(yearMonth);
    }

    // Get all expenses for the user (exclude reimbursable and reimbursed expenses)
    const expenses = await Expense.find({
      userId: req.user.id,
      $or: [
        { reimbursable: false },
        { reimbursable: { $exists: false } }
      ],
      $and: [
        {
          $or: [
            { reimbursed: false },
            { reimbursed: { $exists: false } }
          ]
        }
      ]
    });

    // Get all reimbursable expenses for the user
    const reimbursableExpenses = await Expense.find({
      userId: req.user.id,
      reimbursable: true
    });

    // Calculate total spent for each month
    const comparisonData = monthsList.map(month => {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

      // Filter expenses for this month
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });

      // Filter reimbursable expenses for this month
      const monthReimbursableExpenses = reimbursableExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });

      // Calculate total
      const totalSpent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Calculate total reimbursable
      const totalReimbursable = monthReimbursableExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Format month name (e.g., "Jan 2025")
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      return {
        month,
        monthName,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        totalReimbursable: parseFloat(totalReimbursable.toFixed(2))
      };
    });

    res.status(200).json({
      success: true,
      data: comparisonData
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
  getMonthlySummary,
  getMonthlyComparison
};
