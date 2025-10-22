const { prisma } = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Iniciando seed de datos completo...');

    try {
        // 1. Crear Categorías
        console.log('Creando categorías...');
        const categorias = await Promise.all([
            prisma.category.upsert({
                where: { name: 'Repuestos de Motor' },
                update: {},
                create: { name: 'Repuestos de Motor' }
            }),
            prisma.category.upsert({
                where: { name: 'Frenos y Suspensión' },
                update: {},
                create: { name: 'Frenos y Suspensión' }
            }),
            prisma.category.upsert({
                where: { name: 'Sistema Eléctrico' },
                update: {},
                create: { name: 'Sistema Eléctrico' }
            }),
            prisma.category.upsert({
                where: { name: 'Lubricantes y Fluidos' },
                update: {},
                create: { name: 'Lubricantes y Fluidos' }
            }),
            prisma.category.upsert({
                where: { name: 'Accesorios y Herramientas' },
                update: {},
                create: { name: 'Accesorios y Herramientas' }
            }),
            prisma.category.upsert({
                where: { name: 'Llantas y Neumáticos' },
                update: {},
                create: { name: 'Llantas y Neumáticos' }
            })
        ]);
        console.log(`✓ ${categorias.length} categorías creadas`);

        // 2. Crear Usuarios Proveedores
        console.log('Creando usuarios proveedores...');
        const passwordHash = await bcrypt.hash('proveedor123', 12);

        const usuarios = [];
        const emailsProveedores = [
            'autopartes.guatemala@example.com',
            'repuestos.express@example.com',
            'mecanica.central@example.com',
            'lubricantes.premium@example.com'
        ];

        for (const email of emailsProveedores) {
            const usuario = await prisma.user.upsert({
                where: { email },
                update: {},
                create: {
                    name: email.split('@')[0].replace(/\./g, ' ').toUpperCase(),
                    email,
                    passwordHash,
                    role: 'PROVEEDOR',
                    active: true,
                    telefono: `+502 ${Math.floor(Math.random() * 90000000) + 10000000}`,
                    direccion: 'Ciudad de Guatemala'
                }
            });
            usuarios.push(usuario);
        }
        console.log(`✓ ${usuarios.length} usuarios proveedores creados`);

        // 3. Crear Proveedores vinculados a los usuarios
        console.log('Creando perfiles de proveedores...');
        const proveedoresData = [
            {
                userId: usuarios[0].id,
                nombreComercial: 'AutoPartes Guatemala',
                nit: '12345678-9',
                direccion: 'Zona 1, Ciudad de Guatemala',
                latitud: 14.6349,
                longitud: -90.5069,
                telefono: '+502 22345678'
            },
            {
                userId: usuarios[1].id,
                nombreComercial: 'Repuestos Express',
                nit: '23456789-0',
                direccion: 'Zona 10, Ciudad de Guatemala',
                latitud: 14.5995,
                longitud: -90.5157,
                telefono: '+502 23456789'
            },
            {
                userId: usuarios[2].id,
                nombreComercial: 'Mecánica Central',
                nit: '34567890-1',
                direccion: 'Zona 12, Ciudad de Guatemala',
                latitud: 14.5833,
                longitud: -90.5667,
                telefono: '+502 24567890'
            },
            {
                userId: usuarios[3].id,
                nombreComercial: 'Lubricantes Premium',
                nit: '45678901-2',
                direccion: 'Zona 4, Ciudad de Guatemala',
                latitud: 14.6200,
                longitud: -90.5100,
                telefono: '+502 25678901'
            }
        ];

        const proveedores = [];
        for (const data of proveedoresData) {
            const proveedor = await prisma.proveedor.upsert({
                where: { userId: data.userId },
                update: {},
                create: data
            });
            proveedores.push(proveedor);
        }
        console.log(`✓ ${proveedores.length} proveedores creados`);

        // 4. Crear Productos vinculados a Categorías y Proveedores
        console.log('Creando productos...');
        const productos = [
            // Productos de AutoPartes Guatemala
            {
                nombre: 'Filtro de Aceite',
                precio: 45.00,
                stock: 50,
                descripcion: 'Filtro de aceite universal para motores de gasolina',
                categoryId: categorias[0].id,
                proveedorId: proveedores[0].id,
                imagenUrl: ['https://example.com/filtro-aceite.jpg'],
                activo: true
            },
            {
                nombre: 'Bujías NGK',
                precio: 25.00,
                stock: 100,
                descripcion: 'Bujías de alta calidad para mejor rendimiento',
                categoryId: categorias[0].id,
                proveedorId: proveedores[0].id,
                imagenUrl: ['https://example.com/bujias.jpg'],
                activo: true
            },
            {
                nombre: 'Batería 12V 75Ah',
                precio: 850.00,
                stock: 20,
                descripcion: 'Batería de arranque libre de mantenimiento',
                categoryId: categorias[2].id,
                proveedorId: proveedores[0].id,
                imagenUrl: ['https://example.com/bateria.jpg'],
                activo: true
            },

            // Productos de Repuestos Express
            {
                nombre: 'Pastillas de Freno Delanteras',
                precio: 180.00,
                stock: 30,
                descripcion: 'Pastillas de freno cerámicas de alta durabilidad',
                categoryId: categorias[1].id,
                proveedorId: proveedores[1].id,
                imagenUrl: ['https://example.com/pastillas-freno.jpg'],
                activo: true
            },
            {
                nombre: 'Amortiguadores Traseros',
                precio: 450.00,
                stock: 15,
                descripcion: 'Amortiguadores hidráulicos para suspensión trasera',
                categoryId: categorias[1].id,
                proveedorId: proveedores[1].id,
                imagenUrl: ['https://example.com/amortiguadores.jpg'],
                activo: true
            },
            {
                nombre: 'Kit de Embrague',
                precio: 1250.00,
                stock: 10,
                descripcion: 'Kit completo de embrague con disco, plato y collarin',
                categoryId: categorias[0].id,
                proveedorId: proveedores[1].id,
                imagenUrl: ['https://example.com/embrague.jpg'],
                activo: true
            },

            // Productos de Mecánica Central
            {
                nombre: 'Alternador Reconstruido',
                precio: 950.00,
                stock: 8,
                descripcion: 'Alternador reconstruido con garantía de 6 meses',
                categoryId: categorias[2].id,
                proveedorId: proveedores[2].id,
                imagenUrl: ['https://example.com/alternador.jpg'],
                activo: true
            },
            {
                nombre: 'Motor de Arranque',
                precio: 1100.00,
                stock: 6,
                descripcion: 'Motor de arranque refaccionado para vehículos livianos',
                categoryId: categorias[2].id,
                proveedorId: proveedores[2].id,
                imagenUrl: ['https://example.com/motor-arranque.jpg'],
                activo: true
            },
            {
                nombre: 'Juego de Llaves Mixtas',
                precio: 350.00,
                stock: 25,
                descripcion: 'Set de 12 llaves mixtas métricas de 8mm a 19mm',
                categoryId: categorias[4].id,
                proveedorId: proveedores[2].id,
                imagenUrl: ['https://example.com/llaves.jpg'],
                activo: true
            },

            // Productos de Lubricantes Premium
            {
                nombre: 'Aceite Motor 20W-50',
                precio: 95.00,
                stock: 80,
                descripcion: 'Aceite mineral para motor 20W-50, garrafa de 1 galón',
                categoryId: categorias[3].id,
                proveedorId: proveedores[3].id,
                imagenUrl: ['https://example.com/aceite-motor.jpg'],
                activo: true
            },
            {
                nombre: 'Aceite Sintético 5W-30',
                precio: 185.00,
                stock: 60,
                descripcion: 'Aceite sintético de alta performance, garrafa de 1 galón',
                categoryId: categorias[3].id,
                proveedorId: proveedores[3].id,
                imagenUrl: ['https://example.com/aceite-sintetico.jpg'],
                activo: true
            },
            {
                nombre: 'Refrigerante Anticongelante',
                precio: 65.00,
                stock: 45,
                descripcion: 'Refrigerante verde concentrado, garrafa de 1 galón',
                categoryId: categorias[3].id,
                proveedorId: proveedores[3].id,
                imagenUrl: ['https://example.com/refrigerante.jpg'],
                activo: true
            },
            {
                nombre: 'Líquido de Frenos DOT 4',
                precio: 55.00,
                stock: 40,
                descripcion: 'Líquido de frenos DOT 4, botella de 500ml',
                categoryId: categorias[3].id,
                proveedorId: proveedores[3].id,
                imagenUrl: ['https://example.com/liquido-frenos.jpg'],
                activo: true
            },

            // Más productos variados
            {
                nombre: 'Llanta 185/65 R15',
                precio: 550.00,
                stock: 24,
                descripcion: 'Llanta radial para auto compacto',
                categoryId: categorias[5].id,
                proveedorId: proveedores[1].id,
                imagenUrl: ['https://example.com/llanta.jpg'],
                activo: true
            },
            {
                nombre: 'Gato Hidráulico 2 Ton',
                precio: 280.00,
                stock: 12,
                descripcion: 'Gato hidráulico de piso para levantamiento de vehículos',
                categoryId: categorias[4].id,
                proveedorId: proveedores[2].id,
                imagenUrl: ['https://example.com/gato.jpg'],
                activo: true
            },
            {
                nombre: 'Limpia Parabrisas Delanteros',
                precio: 85.00,
                stock: 50,
                descripcion: 'Par de escobillas limpiaparabrisas universales 18"',
                categoryId: categorias[4].id,
                proveedorId: proveedores[0].id,
                imagenUrl: ['https://example.com/limpiaparabrisas.jpg'],
                activo: true
            }
        ];

        for (const productoData of productos) {
            await prisma.producto.upsert({
                where: {
                    // No tenemos unique constraint en nombre, usar combinación
                    id: 0 // Esto forzará siempre create en primera ejecución
                },
                update: {},
                create: productoData
            }).catch(async () => {
                // Si falla, intentar buscar por nombre y proveedor
                const existe = await prisma.producto.findFirst({
                    where: {
                        nombre: productoData.nombre,
                        proveedorId: productoData.proveedorId
                    }
                });
                if (!existe) {
                    return prisma.producto.create({ data: productoData });
                }
                return existe;
            });
        }
        console.log(`✓ ${productos.length} productos creados`);

        // 5. Crear un usuario regular de prueba
        console.log('Creando usuario cliente de prueba...');
        await prisma.user.upsert({
            where: { email: 'cliente@example.com' },
            update: {},
            create: {
                name: 'Cliente Prueba',
                email: 'cliente@example.com',
                passwordHash: await bcrypt.hash('cliente123', 12),
                role: 'USUARIO',
                active: true,
                telefono: '+502 30001234',
                direccion: 'Zona 15, Ciudad de Guatemala'
            }
        });
        console.log('✓ Usuario cliente creado');

        console.log('\n=== SEED COMPLETADO EXITOSAMENTE ===');
        console.log('\nCredenciales de proveedores creados:');
        console.log('Email: autopartes.guatemala@example.com | Password: proveedor123');
        console.log('Email: repuestos.express@example.com | Password: proveedor123');
        console.log('Email: mecanica.central@example.com | Password: proveedor123');
        console.log('Email: lubricantes.premium@example.com | Password: proveedor123');
        console.log('\nCredenciales de cliente:');
        console.log('Email: cliente@example.com | Password: cliente123');
        console.log('\nResumen:');
        console.log(`- ${categorias.length} categorías`);
        console.log(`- ${proveedores.length} proveedores`);
        console.log(`- ${productos.length} productos`);
        console.log('- 1 usuario cliente');

    } catch (error) {
        console.error('Error durante el seed:', error);
        throw error;
    }
}

main()
    .catch(e => {
        console.error('Error fatal:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

