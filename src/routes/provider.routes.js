const express = require("express");
const { authRequired } = require("../middleware/auth");
const { providerAuthRequired } = require("../middleware/providerAuth");
const { list, getById, getMyProfile, updateMyProfile, becomeProvider } = require("../controllers/provider.controller");

const router = express.Router();

// Rutas públicas
router.get("/", list); // Listar proveedores con filtros
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
router.get("/me/profile", getMyProfile);
router.put("/me/profile", updateMyProfile);

module.exports = router;
