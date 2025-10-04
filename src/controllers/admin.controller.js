const { prisma } = require("../config/prisma");
const bcrypt = require("bcryptjs");

async function createAdmin(req, res) {
    try {
        // Solo un admin puede crear otro admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "No autorizado" });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "nombre, email y password son requeridos" });
        }

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(409).json({ error: "El email ya está registrado" });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const admin = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'ADMIN'
            }
        });

        res.status(201).json({
            message: "Administrador creado exitosamente",
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error al crear administrador" });
    }
}

async function listUsers(req, res) {
    try {
        const users = await prisma.user.findMany({
            include: {
                proveedor: true
            }
        });

        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            telefono: user.telefono,
            direccion: user.direccion,
            createdAt: user.createdAt,
            ...(user.proveedor && {
                proveedor: {
                    id: user.proveedor.id,
                    nombreComercial: user.proveedor.nombreComercial,
                    NIT: user.proveedor.nit,
                    direccion: user.proveedor.direccion,
                    latitud: user.proveedor.latitud,
                    longitud: user.proveedor.longitud
                }
            })
        }));

        res.json(formattedUsers);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error al listar usuarios" });
    }
}

async function updateUserStatus(req, res) {
    try {
        const { userId } = req.params;
        const { active } = req.body;

        const user = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { active: Boolean(active) }
        });

        res.json({
            message: `Usuario ${active ? 'activado' : 'desactivado'} exitosamente`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                active: user.active
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error al actualizar estado del usuario" });
    }
}

module.exports = {
    createAdmin,
    listUsers,
    updateUserStatus
};
