const { prisma } = require("../config/prisma");

async function list(req, res) {
  const items = await prisma.producto.findMany({ orderBy: { id: "asc" } });
  res.json(items);
}

async function create(req, res) {
  try {
    const { name, price, inStock = true } = req.body;
    if (!name || price == null) return res.status(400).json({ error: "name y price requeridos" });

    const producto = await prisma.producto.create({
      data: { name, price, inStock }
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
    const { name, price, inStock } = req.body;
    const producto = await prisma.producto.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price }),
        ...(inStock !== undefined && { inStock })
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
