const Category = require('../models/Category');

// Get all categories for logged in user
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id }).sort({ createdAt: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name'
      });
    }

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      userId: req.user.id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({
      userId: req.user.id,
      name
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    // Check for duplicate key error from MongoDB
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category belongs to logged in user
    if (category.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this category'
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory
};
