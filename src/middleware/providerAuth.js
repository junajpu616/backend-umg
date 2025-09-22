const { prisma } = require("../config/prisma");

// Middleware para verificar que el usuario es un proveedor
async function providerAuthRequired(req, res, next) {
    try {
        // Verificar que el usuario tenga rol PROVEEDOR
        if (req.user.role !== 'PROVEEDOR') {
            return res.status(403).json({ error: "Acceso denegado. Se requiere rol de proveedor." });
        }

        // Verificar que el usuario tenga un registro de proveedor
        const proveedor = await prisma.proveedor.findUnique({
            where: { userId: req.user.id }
        });

        if (!proveedor) {
            return res.status(403).json({ error: "Acceso denegado. Registro de proveedor no encontrado." });
        }

        // Agregar el proveedor al objeto request para uso posterior
        req.proveedor = proveedor;
        next();
    } catch (error) {
        console.error('Error en providerAuthRequired:', error);
        res.status(500).json({ error: "Error de autorización" });
    }
}

module.exports = { providerAuthRequired };
