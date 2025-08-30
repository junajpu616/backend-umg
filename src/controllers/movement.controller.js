const { prisma } = require("../config/prisma");
const { verificarStock } = require("../utils/alertas");

async function registrarMovimiento(req, res) {
  try {
    const { productoId, tipo, cantidad } = req.body;

    if (!productoId || !tipo || !["entrada", "salida"].includes(tipo) || !cantidad) {
      return res.status(400).json({ error: "Campos inválidos" });
    }

    const producto = await prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    let nuevoStock = tipo === "entrada" ? producto.stock + cantidad : producto.stock - cantidad;
    if (nuevoStock < 0) return res.status(400).json({ error: "Stock insuficiente" });

    const movimiento = await prisma.movimiento.create({
      data: { productoId, tipo, cantidad }
    });

    await prisma.producto.update({
      where: { id: productoId },
      data: { stock: nuevoStock }
    });

    const productoActualizado = await prisma.producto.findUnique({ where: { id: productoId } });
    verificarStock(productoActualizado); // Activar alerta si aplica.

    res.status(201).json(movimiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar movimiento" });
  }
}

async function listarMovimientos(req, res) {
  try {
    const movimientos = await prisma.movimiento.findMany({
      include: { producto: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(movimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar movimientos" });
  }
}

module.exports = { registrarMovimiento, listarMovimientos };