const express = require("express");
const { register, login, me, changePassword } = require("../controllers/auth.controller");
const { setup2FA, enable2FA, disable2FA, verifyLogin2FA } = require("../controllers/twofa.controller");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación y seguridad
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario o proveedor
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 enum: [USUARIO, PROVEEDOR]
 *                 example: PROVEEDOR
 *               telefono:
 *                 type: string
 *                 example: "+50212345678"
 *               direccion:
 *                 type: string
 *                 example: "Ciudad de Guatemala"
 *               nombreComercial:
 *                 type: string
 *                 example: "Comercial XYZ"
 *               rfc:
 *                 type: string
 *                 example: "RFC123456789"
 *               latitud:
 *                 type: number
 *                 example: 14.6349
 *               longitud:
 *                 type: number
 *                 example: -90.5069
 *     responses:
 *       201:
 *         description: Registro exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Datos inválidos o incompletos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         description: El email ya está registrado
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión (requiere 2FA si está habilitado)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login exitoso o requiere 2FA
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: "#/components/schemas/AuthResponse"
 *                 - type: object
 *                   properties:
 *                     requires2FA:
 *                       type: boolean
 *                       example: true
 *                     tmpToken:
 *                       type: string
 *                       example: "tmp.jwt.token"
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *                 proveedor:
 *                   $ref: "#/components/schemas/Proveedor"
 *       401:
 *         description: Token inválido o expirado
 */
router.get("/me", authRequired, me);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Cambiar contraseña
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 example: nuevoPass789
 *     responses:
 *       200:
 *         description: Contraseña cambiada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada exitosamente"
 *       401:
 *         description: Contraseña actual incorrecta o no autenticado
 *       500:
 *         description: Error interno
 */
router.post("/change-password", authRequired, changePassword);

// 2FA routes
/**
 * @swagger
 * /api/auth/2fa/setup:
 *   post:
 *     summary: Generar secreto temporal y QR para configurar 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Secreto y QR generados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/TwoFASetupResponse"
 *       400:
 *         description: 2FA ya está habilitado
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error interno
 */
router.post("/2fa/setup", authRequired, setup2FA);

/**
 * @swagger
 * /api/auth/2fa/enable:
 *   post:
 *     summary: Habilitar la autenticación en dos pasos (2FA)
 *     tags: [2FA]
 *     description: Verifica el código TOTP generado en la app de autenticación y habilita el 2FA para el usuario.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA habilitado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "2FA habilitado"
 *       400:
 *         description: Código inválido o error en la verificación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post("/2fa/enable", authRequired, enable2FA);

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Deshabilitar 2FA en la cuenta
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA deshabilitado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/TwoFADisableResponse"
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error interno
 */
router.post("/2fa/disable", authRequired, disable2FA);

/**
 * @swagger
 * /api/auth/2fa/verify-login:
 *   post:
 *     summary: Verificar código 2FA en login
 *     tags: [2FA]
 *     description: Verifica el código TOTP junto con un token temporal (tmpToken) y devuelve un token JWT válido para acceder al sistema.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login verificado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Juan Pérez"
 *                     email:
 *                       type: string
 *                       example: "juan@example.com"
 *       400:
 *         description: Código inválido o tipo de token incorrecto
 *       401:
 *         description: Token temporal inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post("/2fa/verify-login", verifyLogin2FA);

module.exports = router;
