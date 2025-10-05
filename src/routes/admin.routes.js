const express = require("express");
const { authRequired } = require("../middleware/auth");
const { adminAuthRequired } = require("../middleware/adminAuth");
const {
    createAdmin,
    listUsers,
    updateUserStatus
} = require("../controllers/admin.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gestión administrativa del sistema (solo administradores)
 */

// Todas las rutas requieren autenticación y ser admin
router.use(authRequired);
router.use(adminAuthRequired);

/**
 * @swagger
 * /api/admin/create-admin:
 *   post:
 *     summary: Crear un nuevo administrador
 *     description: Solo un administrador puede crear otros administradores en el sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "Carlos Admin"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "adminPassword123"
 *     responses:
 *       201:
 *         description: Administrador creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Administrador creado exitosamente"
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     name:
 *                       type: string
 *                       example: "Carlos Admin"
 *                     email:
 *                       type: string
 *                       example: "admin@example.com"
 *                     role:
 *                       type: string
 *                       example: "ADMIN"
 *       400:
 *         description: Datos requeridos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "nombre, email y password son requeridos"
 *       403:
 *         description: No autorizado (no es administrador)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El email ya está registrado"
 *       500:
 *         description: Error interno del servidor
 */
router.post("/create-admin", createAdmin);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Listar todos los usuarios del sistema
 *     description: Obtiene una lista completa de todos los usuarios registrados (usuarios, proveedores y administradores) con su información asociada
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   email:
 *                     type: string
 *                     example: "juan@example.com"
 *                   role:
 *                     type: string
 *                     enum: [USUARIO, PROVEEDOR, ADMIN]
 *                     example: "PROVEEDOR"
 *                   telefono:
 *                     type: string
 *                     example: "+50212345678"
 *                   direccion:
 *                     type: string
 *                     example: "Ciudad de Guatemala"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00.000Z"
 *                   proveedor:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nombreComercial:
 *                         type: string
 *                         example: "Comercial XYZ"
 *                       NIT:
 *                         type: string
 *                         example: "1234567-8"
 *                       direccion:
 *                         type: string
 *                         example: "Zona 10, Guatemala"
 *                       latitud:
 *                         type: number
 *                         format: float
 *                         example: 14.6349
 *                       longitud:
 *                         type: number
 *                         format: float
 *                         example: -90.5069
 *       401:
 *         description: Token inválido o no autenticado
 *       403:
 *         description: No tiene permisos de administrador
 *       500:
 *         description: Error interno del servidor
 */
router.get("/users", listUsers);

/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   put:
 *     summary: Actualizar el estado activo/inactivo de un usuario
 *     description: Permite al administrador activar o desactivar una cuenta de usuario en el sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a modificar
 *         example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - active
 *             properties:
 *               active:
 *                 type: boolean
 *                 description: Estado del usuario (true = activo, false = inactivo)
 *                 example: false
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario desactivado exitosamente"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     name:
 *                       type: string
 *                       example: "Juan Pérez"
 *                     email:
 *                       type: string
 *                       example: "juan@example.com"
 *                     active:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Token inválido o no autenticado
 *       403:
 *         description: No tiene permisos de administrador
 *       500:
 *         description: Error al actualizar estado del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar estado del usuario"
 */
router.put("/users/:userId/status", updateUserStatus);

module.exports = router;
