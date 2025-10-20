const { prisma } = require("../config/prisma");

const getEstados = async (req, res) => {
    try {
        const estados = await prisma.estadoPedido.findMany();
        res.status(200).json(estados);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los estados de pedido", error: error.message });
    }
};

const createEstado = async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
        return res.status(400).json({ message: "El campo 'nombre' es obligatorio." });
    }
    try {
        const nuevoEstado = await prisma.estadoPedido.create({
            data: { nombre, descripcion },
        });
        res.status(201).json(nuevoEstado);
    } catch (error) {
        res.status(400).json({ message: "Error al crear el estado de pedido", error: error.message });
    }
};

const updateEstado = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
        const estadoActualizado = await prisma.estadoPedido.update({
            where: { id: parseInt(id) },
            data: { nombre, descripcion },
        });
        res.status(200).json(estadoActualizado);
    } catch (error) {
        res.status(404).json({ message: "Estado de pedido no encontrado o error al actualizar", error: error.message });
    }
};

const deleteEstado = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.estadoPedido.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send(); // No content
    } catch (error) {
        res.status(404).json({ message: "Estado de pedido no encontrado o error al eliminar", error: error.message });
    }
};

module.exports = {
    getEstados,
    createEstado,
    updateEstado,
    deleteEstado,
};
