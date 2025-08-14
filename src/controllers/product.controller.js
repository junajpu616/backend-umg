const { prisma } = require("../config/prisma");

async function list(req, res) {
  const items = await prisma.producto.findMany({ orderBy: { id: "asc" } });
  res.json(items);
}

async function create(req, res) {
  try {
    const { nombre, precio, stock, descripcion } = req.body;
    if (!nombre || precio == null || stock == null || descripcion == null) {
      return res.status(400).json({ error: "nombre, precio y stock son requeridos" });
    }

    const producto = await prisma.producto.create({
      data: { nombre, precio, stock, descripcion }
    });
    res.status(201).json(producto);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al crear producto" });
  }
}

async function getById(req, res) {
  const id = Number(req.params.id);
  const producto = await prisma.producto.findUnique({ where: { id } });
  if (!producto) return res.status(404).json({ error: "No encontrado" });
  res.json(producto);
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { nombre, precio, stock, descripcion } = req.body;
    const producto = await prisma.producto.update({
      where: { id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(precio !== undefined && { precio }),
        ...(stock !== undefined && { stock }),
        ...(descripcion !== undefined && { descripcion })
      }
    });
    res.json(producto);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al actualizar" });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.producto.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al eliminar" });
  }
}

module.exports = { list, create, getById, update, remove };
