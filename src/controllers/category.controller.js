const { prisma } = require("../config/prisma");

// Create a new category
async function createCategory(req, res) {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({
      data: {
        name,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
}

// Get all categories
async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
}

// Get a single category by ID
async function getCategoryById(req, res){
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
}

// Update a category
async function updateCategory(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.status(200).json(category);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
}

// Delete a category
async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
}

module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };