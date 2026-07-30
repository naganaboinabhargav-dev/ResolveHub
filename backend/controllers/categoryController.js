const asyncHandler = require('../utils/asyncHandler');
const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.activeOnly === 'true') filter.isActive = true;
  if (req.query.resourceType) filter.applicableResourceTypes = req.query.resourceType;

  const categories = await Category.find(filter).sort({ name: 1 });
  res.json({ success: true, count: categories.length, categories });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ success: true, category });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  Object.assign(category, req.body);
  await category.save();
  res.json({ success: true, category });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category removed' });
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
