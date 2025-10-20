const { prisma } = require("../config/prisma");

const getTipos = async (req, res) => {
    try {
        const tipos = await prisma.tipoMovimiento.findMany();
        res.status(200).json(tipos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los tipos de movimiento", error: error.message });
    }
};

const createTipo = async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
        return res.status(400).json({ message: "El campo 'nombre' es obligatorio." });
    }
    try {
        const nuevoTipo = await prisma.tipoMovimiento.create({
            data: { nombre, descripcion },
        });
        res.status(201).json(nuevoTipo);
    } catch (error) {
        res.status(400).json({ message: "Error al crear el tipo de movimiento", error: error.message });
    }
};

const updateTipo = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
        const tipoActualizado = await prisma.tipoMovimiento.update({
            where: { id: parseInt(id) },
            data: { nombre, descripcion },
        });
        res.status(200).json(tipoActualizado);
    } catch (error) {
        res.status(404).json({ message: "Tipo de movimiento no encontrado o error al actualizar", error: error.message });
    }
};

const deleteTipo = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.tipoMovimiento.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send(); // No content
    } catch (error) {
        res.status(404).json({ message: "Tipo de movimiento no encontrado o error al eliminar", error: error.message });
    }
};

module.exports = {
    getTipos,
    createTipo,
    updateTipo,
    deleteTipo,
};
