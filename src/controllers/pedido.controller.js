const { prisma } = require("../config/prisma");

const createPedido = async (req, res) => {
    const { items } = req.body; // Array de { productoId, cantidad }
    const userId = req.user.id; // Obtenido del middleware authRequired

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "El carrito está vacío." });
    }

    try {
        const nuevoPedido = await prisma.$transaction(async (tx) => {
            const estadoPendiente = await tx.estadoPedido.findUnique({ where: { nombre: 'PENDIENTE' } });
            const tipoVenta = await tx.tipoMovimiento.findUnique({ where: { nombre: 'VENTA' } });

            if (!estadoPendiente || !tipoVenta) {
                throw new Error("Configuración inicial no encontrada (Estados o Tipos de Movimiento).");
            }

            const productoIds = items.map(item => item.productoId);
            const productos = await tx.producto.findMany({ where: { id: { in: productoIds } } });

            let totalPedido = 0;
            const itemsParaCrear = [];

            for (const item of items) {
                const producto = productos.find(p => p.id === item.productoId);
                if (!producto) throw new Error(`Producto con ID ${item.productoId} no encontrado.`);
                if (producto.stock < item.cantidad) throw new Error(`Stock insuficiente para: ${producto.nombre}.`);
                if (item.cantidad <= 0) throw new Error('La cantidad debe ser mayor a cero.');

                const subtotal = producto.precio * item.cantidad;
                totalPedido += subtotal;
                itemsParaCrear.push({ productoId: item.productoId, cantidad: item.cantidad, precio: producto.precio, subtotal });
            }

            const pedido = await tx.pedido.create({
                data: {
                    userId,
                    estadoId: estadoPendiente.id,
                    total: totalPedido,
                    comision: totalPedido * 0.10,
                    items: { create: itemsParaCrear },
                },
                include: { items: true, estado: true },
            });

            for (const item of items) {
                await tx.producto.update({ where: { id: item.productoId }, data: { stock: { decrement: item.cantidad } } });
                await tx.movimiento.create({ data: { tipoId: tipoVenta.id, cantidad: item.cantidad, productoId: item.productoId } });
            }

            return pedido;
        });

        res.status(201).json(nuevoPedido);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePedidoEstado = async (req, res) => {
    const { id } = req.params;
    const { estadoId } = req.body;
    const { id: userId, role } = req.user;

    try {
        const updatedPedido = await prisma.$transaction(async (tx) => {
            const pedidoActual = await tx.pedido.findUnique({
                where: { id: parseInt(id) },
                include: { estado: true, items: { include: { producto: { select: { proveedorId: true } } } } },
            });

            if (!pedidoActual) {
                throw { status: 404, message: "Pedido no encontrado." };
            }

            // --- Lógica de Autorización ---
            if (role === 'ADMIN') {
                // El admin siempre está autorizado.
            } else if (role === 'PROVEEDOR') {
                const proveedorInfo = await tx.proveedor.findUnique({ where: { userId } });
                if (!proveedorInfo) {
                    throw { status: 403, message: "Perfil de proveedor no encontrado para este usuario." };
                }
                const esDueñoDeTodos = pedidoActual.items.every(item => item.producto.proveedorId === proveedorInfo.id);
                if (!esDueñoDeTodos) {
                    throw { status: 403, message: "No tiene permiso para modificar este pedido." };
                }
            } else {
                throw { status: 403, message: "No tiene permiso para modificar el estado de un pedido." };
            }

            const estadoEntregado = await tx.estadoPedido.findUnique({ where: { nombre: 'ENTREGADO' } });
            const estadoCancelado = await tx.estadoPedido.findUnique({ where: { nombre: 'CANCELADO' } });

            if (pedidoActual.estadoId === estadoEntregado.id || pedidoActual.estadoId === estadoCancelado.id) {
                throw { status: 400, message: `El pedido ya está en estado '${pedidoActual.estado.nombre}' y no puede ser modificado.` };
            }

            const nuevoEstado = await tx.estadoPedido.findUnique({ where: { id: estadoId } });
            if (!nuevoEstado) throw { status: 400, message: "El estado proporcionado no es válido." };
            if (pedidoActual.estadoId === nuevoEstado.id) return pedidoActual;

            if (nuevoEstado.id === estadoCancelado.id) {
                const tipoDevolucion = await tx.tipoMovimiento.findUnique({ where: { nombre: 'DEVOLUCION' } });
                if (!tipoDevolucion) throw new Error("Configuración de 'DEVOLUCION' no encontrada.");

                for (const item of pedidoActual.items) {
                    await tx.producto.update({ where: { id: item.productoId }, data: { stock: { increment: item.cantidad } } });
                    await tx.movimiento.create({ data: { tipoId: tipoDevolucion.id, cantidad: item.cantidad, productoId: item.productoId } });
                }
            }

            return tx.pedido.update({
                where: { id: parseInt(id) },
                data: { estadoId: nuevoEstado.id },
                include: { estado: true, items: true },
            });
        });

        res.status(200).json(updatedPedido);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

module.exports = { createPedido, updatePedidoEstado };
