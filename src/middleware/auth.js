const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");

async function authRequired(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario exista y esté activo
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    if (!user.active) {
      return res.status(403).json({ error: "Tu cuenta ha sido desactivada. Contacta al administrador" });
    }

    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

module.exports = { authRequired };
