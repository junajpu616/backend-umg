const { prisma } = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    try {
        // Verificar si ya existe un admin
        const adminExists = await prisma.user.findFirst({
            where: {
                role: 'ADMIN'
            }
        });

        if (adminExists) {
            console.log('Ya existe un administrador en el sistema');
            return;
        }

        // Crear el primer administrador
        const passwordHash = await bcrypt.hash('admin123', 12);
        const admin = await prisma.user.create({
            data: {
                name: 'Administrador',
                email: 'admin@sistema.com',
                passwordHash,
                role: 'ADMIN',
                active: true
            }
        });

        console.log('Administrador creado exitosamente:', {
            id: admin.id,
            email: admin.email,
            role: admin.role
        });
        console.log('Credenciales por defecto:');
        console.log('Email: admin@sistema.com');
        console.log('Contraseña: admin123');
        console.log('¡IMPORTANTE! Cambiar la contraseña después del primer inicio de sesión');

    } catch (error) {
        console.error('Error al crear el administrador:', error);
        process.exit(1);
    }
}

main();
