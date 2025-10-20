const { prisma } = require("../config/prisma");

const createPedido = async (req, res) => {
    const { items } = req.body; // Array de { productoId, cantidad }
    const userId = req.user.id; // Obtenido del middleware authRequired

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "El carrito está vacío." });
    }

    try {
        const nuevoPedido = await prisma.$transaction(async (tx) => {
            // 1. Obtener los datos necesarios (IDs de estado y tipo de movimiento)
            const estadoPendiente = await tx.estadoPedido.findUnique({ where: { nombre: 'PENDIENTE' } });
            const tipoVenta = await tx.tipoMovimiento.findUnique({ where: { nombre: 'VENTA' } });

            if (!estadoPendiente || !tipoVenta) {
                throw new Error("Configuración inicial no encontrada (Estados o Tipos de Movimiento).");
            }

            // 2. Obtener los productos y verificar stock
            const productoIds = items.map(item => item.productoId);
            const productos = await tx.producto.findMany({
                where: { id: { in: productoIds } },
            });

            let totalPedido = 0;
            const itemsParaCrear = [];

            for (const item of items) {
                const producto = productos.find(p => p.id === item.productoId);
                if (!producto) {
                    throw new Error(`Producto con ID ${item.productoId} no encontrado.`);
                }
                if (producto.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para el producto: ${producto.nombre}.`);
                }
                if (item.cantidad <= 0) {
                    throw new Error('La cantidad debe ser mayor a cero.');
                }

                const subtotal = producto.precio * item.cantidad;
                totalPedido += subtotal;

                itemsParaCrear.push({
                    productoId: item.productoId,
                    cantidad: item.cantidad,
                    precio: producto.precio,
                    subtotal: subtotal,
                });
            }

            // 3. Crear el Pedido
            const pedido = await tx.pedido.create({
                data: {
                    userId: userId,
                    estadoId: estadoPendiente.id,
                    total: totalPedido,
                    comision: totalPedido * 0.10,
                    items: {
                        create: itemsParaCrear,
                    },
                },
                include: { items: true, estado: true },
            });

            // 4. Actualizar stock y crear movimientos
            for (const item of items) {
                // Descontar stock
                await tx.producto.update({
                    where: { id: item.productoId },
                    data: { stock: { decrement: item.cantidad } },
                });
                // Registrar el movimiento de salida
                await tx.movimiento.create({
                    data: {
                        tipoId: tipoVenta.id,
                        cantidad: item.cantidad,
                        productoId: item.productoId,
                    },
                });
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

    try {
        const updatedPedido = await prisma.$transaction(async (tx) => {
            // 1. Obtener el pedido actual y los estados finales
            const pedidoActual = await tx.pedido.findUnique({
                where: { id: parseInt(id) },
                include: { items: true, estado: true }, // Incluir el estado actual
            });

            if (!pedidoActual) {
                throw new Error("Pedido no encontrado.");
            }

            const estadoEntregado = await tx.estadoPedido.findUnique({ where: { nombre: 'ENTREGADO' } });
            const estadoCancelado = await tx.estadoPedido.findUnique({ where: { nombre: 'CANCELADO' } });

            // 2. VALIDACIÓN: Impedir cambios si el estado actual es final
            if (pedidoActual.estadoId === estadoEntregado.id || pedidoActual.estadoId === estadoCancelado.id) {
                throw new Error(`El pedido ya está en estado '${pedidoActual.estado.nombre}' y no puede ser modificado.`);
            }

            // 3. Validar que el nuevo estado exista
            const nuevoEstado = await tx.estadoPedido.findUnique({ where: { id: estadoId } });
            if (!nuevoEstado) {
                throw new Error("El estado proporcionado no es válido.");
            }

            // Si el estado ya es el deseado, no hacer nada
            if (pedidoActual.estadoId === nuevoEstado.id) {
                return pedidoActual;
            }

            // 4. Lógica de cancelación: Si el nuevo estado es CANCELADO, reponer stock
            if (nuevoEstado.id === estadoCancelado.id) {
                const tipoDevolucion = await tx.tipoMovimiento.findUnique({ where: { nombre: 'DEVOLUCION' } });
                if (!tipoDevolucion) {
                    throw new Error("Tipo de movimiento 'DEVOLUCION' no encontrado.");
                }

                // Reponer stock y crear movimiento de devolución por cada item
                for (const item of pedidoActual.items) {
                    await tx.producto.update({
                        where: { id: item.productoId },
                        data: { stock: { increment: item.cantidad } },
                    });

                    await tx.movimiento.create({
                        data: {
                            tipoId: tipoDevolucion.id,
                            cantidad: item.cantidad,
                            productoId: item.productoId,
                        },
                    });
                }
            }

            // 5. Actualizar el estado del pedido
            const pedidoActualizado = await tx.pedido.update({
                where: { id: parseInt(id) },
                data: { estadoId: nuevoEstado.id },
                include: { estado: true, items: true },
            });

            return pedidoActualizado;
        });

        res.status(200).json(updatedPedido);

    } catch (error) {
        if (error.message === "Pedido no encontrado.") {
            return res.status(404).json({ message: error.message });
        }
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createPedido, updatePedidoEstado };
