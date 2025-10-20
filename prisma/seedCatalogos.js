const { prisma } = require('../src/config/prisma');

async function main() {
    console.log('Empezando con la migración de catalogos...');

    // Crear Tipos de Movimientos
    await prisma.tipoMovimiento.upsert({
        where: { nombre: 'VENTA'},
        update: {},
        create: { nombre: 'VENTA' , descripcion: 'Salida de inventario por venta a cliente.'}
    });

    await prisma.tipoMovimiento.upsert({
        where: { nombre: 'INGRESO'},
        update: {},
        create: { nombre: 'INGRESO' , descripcion: 'Entrada de inventario por inserción de producto por parte de proveedor'}
    });

    await prisma.tipoMovimiento.upsert({
        where: { nombre: 'DEVOLUCION'},
        update: {},
        create: { nombre: 'DEVOLUCION' , descripcion: 'Entrada de inventario por devolución de cliente.'}
    });

    await prisma.tipoMovimiento.upsert({
        where: { nombre: 'AJUSTE' },
        update: {},
        create: { nombre: 'AJUSTE', descripcion: 'Ajuste manual del inventario.' },
    });

    // Crear Estados de Pedido
    await prisma.estadoPedido.upsert({
        where: { nombre: 'PENDIENTE' },
        update: {},
        create: { nombre: 'PENDIENTE', descripcion: 'El pedido ha sido creado pero no confirmado.' },
    });

    await prisma.estadoPedido.upsert({
        where: { nombre: 'CONFIRMADO' },
        update: {},
        create: { nombre: 'CONFIRMADO', descripcion: 'El pedido ha sido confirmado y está en preparación.' },
    });

    await prisma.estadoPedido.upsert({
        where: { nombre: 'ENTREGADO' },
        update: {},
        create: { nombre: 'ENTREGADO', descripcion: 'El pedido ha sido entregado al cliente.' },
    });

    await prisma.estadoPedido.upsert({
        where: { nombre: 'CANCELADO' },
        update: {},
        create: { nombre: 'CANCELADO', descripcion: 'El pedido ha sido cancelado.' },
    });

    console.log('Seed finalizada.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect()
    });