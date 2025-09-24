const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");

function signTmpToken(user) {
  return jwt.sign(
    { type: "2fa", id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );
}

async function setup2FA(req, res) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: "2FA ya está habilitado" });
    }

    const secret = speakeasy.generateSecret({
      name: `UMG_PROYECT (${user.email})`,
      length: 20,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorTempSecret: secret.base32 },
    });

    const otpauth = secret.otpauth_url;
    const qrDataUrl = await qrcode.toDataURL(otpauth);

    return res.json({
      otpauthUrl: otpauth,
      qr: qrDataUrl,
      base32: secret.base32,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al iniciar configuración 2FA" });
  }
}

async function enable2FA(req, res) {
  try {
    const userId = req.user.id;
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "code requerido" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    if (!user.twoFactorTempSecret)
      return res.status(400).json({ error: "No hay secreto temporal. Ejecuta setup primero." });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!verified) return res.status(400).json({ error: "Código inválido" });

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: user.twoFactorTempSecret,
        twoFactorTempSecret: null,
      },
    });

    res.json({ ok: true, message: "2FA habilitado" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al habilitar 2FA" });
  }
}

async function disable2FA(req, res) {
  try {
    const userId = req.user.id;
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorTempSecret: null,
      },
    });
    res.json({ ok: true, message: "2FA deshabilitado" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al deshabilitar 2FA" });
  }
}

async function verifyLogin2FA(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Bearer token requerido" });
    }
    const tmpToken = authHeader.split(" ")[1];
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Código de 2fa es requerido" });

    let payload;
    try {
      payload = jwt.verify(tmpToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "tmpToken inválido o expirado" });
    }
    if (payload.type !== "2fa") return res.status(400).json({ error: "Tipo de token inválido" });

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret)
      return res.status(401).json({ error: "2FA no habilitado" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 1,
    });
    if (!verified) return res.status(401).json({ error: "Código 2FA inválido" });

    const finalToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token: finalToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al verificar 2FA" });
  }
}

module.exports = {
  setup2FA,
  enable2FA,
  disable2FA,
  verifyLogin2FA,
  signTmpToken,
};