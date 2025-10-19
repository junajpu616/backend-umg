const prisma = require('../../generated/prisma').default;

// Crear una nueva categoría (solo para administradores)
exports.createCategory = async (req, res) => {
  try {
    const { nombre } = req.body;
    const category = await prisma.category.create({
      data: { nombre },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la categoría', error: error.message });
  }
};

// Obtener todas las categorías (público)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
  }
};

// Obtener una categoría por ID (público)
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ message: 'Categoría no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la categoría', error: error.message });
  }
};

// Actualizar una categoría (solo para administradores)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { nombre },
    });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la categoría', error: error.message });
  }
};

// Eliminar una categoría (solo para administradores)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la categoría', error: error.message });
  }
};
