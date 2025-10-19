const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { isAdmin, protect } = require('../middleware/auth.middleware');

// Public route to get all categories
router.get('/', categoryController.getCategories);

// Admin routes
router.post('/', protect, isAdmin, categoryController.createCategory);
router.get('/:id', protect, isAdmin, categoryController.getCategoryById);
router.put('/:id', protect, isAdmin, categoryController.updateCategory);
router.delete('/:id', protect, isAdmin, categoryController.deleteCategory);

module.exports = router;
