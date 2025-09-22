const adminAuthRequired = async (req, res, next) => {
    try {
        // Verificar que el usuario tenga rol ADMIN
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                error: "Acceso denegado. Se requieren privilegios de administrador."
            });
        }
        next();
    } catch (error) {
        console.error('Error en adminAuthRequired:', error);
        res.status(500).json({ error: "Error de autorización" });
    }
};

module.exports = { adminAuthRequired };
