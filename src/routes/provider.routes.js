const express = require("express");
const { authRequired } = require("../middleware/auth");
const { providerAuthRequired } = require("../middleware/providerAuth");
const { list, getById, getMyProfile, updateMyProfile, becomeProvider } = require("../controllers/provider.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Proveedores
 *   description: Gestión de proveedores
 */

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: Listar proveedores
 *     description: Permite filtrar por texto usando el parámetro opcional `busqueda` que compara parcialmente contra nombreComercial, dirección y teléfono.
 *     tags: [Proveedores]
 *     parameters:
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *         description: Texto a buscar (coincidencia parcial, insensible a mayúsculas/minúsculas)
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proveedor'
 */
// Rutas públicas
router.get("/", list); // Listar proveedores con filtros

/**
 * @swagger
 * /api/providers/{id}:
 *   get:
 *     summary: Obtener proveedor por ID
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       404:
 *         description: Proveedor no encontrado
 */
router.get("/:id", getById); // Obtener proveedor por id

// Rutas que requieren autenticación (usuarios logueados)
router.use(authRequired);

/**
 * @swagger
 * /api/providers/me/become:
 *   post:
 *     summary: Convertir un usuario en proveedor
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombreComercial, direccion, telefono, latitud, longitud]
 *             properties:
 *               nombreComercial:
 *                 type: string
 *                 example: "Comercial XYZ"
 *               NIT:
 *                 type: string
 *                 example: "1234567-8"
 *               direccion:
 *                 type: string
 *                 example: "Zona 1, Guatemala"
 *               telefono:
 *                 type: string
 *                 example: "+50287654321"
 *               latitud:
 *                 type: number
 *                 example: 14.6349
 *               longitud:
 *                 type: number
 *                 example: -90.5069
 *     responses:
 *       201:
 *         description: Conversión exitosa. Devuelve nuevo token y datos del proveedor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos inválidos o el usuario ya es proveedor
 *       401:
 *         description: No autenticado
 *       409:
 *         description: Conflicto, ya existe registro de proveedor
 */
router.post("/me/become", becomeProvider);

// Rutas que requieren autenticación de proveedor
router.use(providerAuthRequired);

/**
 * @swagger
 * /api/providers/me/profile:
 *   get:
 *     summary: Obtener datos del comercio del proveedor
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del proveedor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No es proveedor
 */
router.get("/me/profile", getMyProfile);

/**
 * @swagger
 * /api/providers/me/profile:
 *   put:
 *     summary: Actualizar datos del comercio del proveedor
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreComercial:
 *                 type: string
 *               NIT:
 *                 type: string
 *               direccion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No es proveedor
 */
router.put("/me/profile", updateMyProfile);

module.exports = router;
