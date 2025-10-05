const express = require("express");
const { authRequired } = require("../middleware/auth");
const { providerAuthRequired } = require("../middleware/providerAuth");
const {
    list,
    listMyProducts,
    create,
    getById,
    update,
    remove,
    activate,
} = require("../controllers/product.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar productos activos (con buscador)
 *     description: |
 *       Retorna solo productos con activo=true. Permite:
 *       - Filtrar por proveedorId (numérico) y categoria (coincidencia exacta).
 *       - Buscar por nombre, descripción o categoría usando `busqueda` (o alias `q` o `caracteristica`). La búsqueda es parcial y sin mayúsculas/minúsculas.
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: proveedorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: caracteristica
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de productos activos
 */
// Rutas públicas (no requieren autenticación)
router.get("/", list);

// Rutas que requieren autenticación
router.use(authRequired);

/**
 * @swagger
 * /api/products/provider/my-products:
 *   get:
 *     summary: Listar mis productos (proveedor)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos del proveedor autenticado
 *       403:
 *         description: Solo los proveedores pueden ver sus productos
 */
// Rutas que requieren ser proveedor (registradas antes de ":id" para evitar colisiones)
router.get("/provider/my-products", providerAuthRequired, listMyProducts); // Listar productos del proveedor

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto (solo proveedor)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, precio, categoria]
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *               categoria:
 *                 type: string
 *               imagenUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Solo proveedores pueden crear productos
 */
router.post("/", providerAuthRequired, create);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar un producto (solo proveedor)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *               categoria:
 *                 type: string
 *               imagenUrl:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */
router.put("/:id", providerAuthRequired, update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Inactivar un producto (solo proveedor)
 *     description: No elimina el recurso; marca activo=false (baja lógica). Solo el proveedor propietario puede inactivarlo.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto inactivado correctamente
 *       403:
 *         description: Sin permisos para inactivar
 *       404:
 *         description: Producto no encontrado
 */
router.delete("/:id", providerAuthRequired, remove);

/**
 * @swagger
 * /api/products/{id}:
 *   post:
 *     summary: Activar un producto (solo proveedor)
 *     description: Marca el producto como activo=true. Solo el proveedor propietario puede activarlo.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto activado correctamente
 *       403:
 *         description: Sin permisos para activar
 *       404:
 *         description: Producto no encontrado
 */
router.post("/:id", providerAuthRequired, activate);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener detalle de producto por ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del producto
 *       404:
 *         description: Producto no encontrado
 */
// Detalle de producto por id (requiere autenticación pero no rol de proveedor)
router.get("/:id", getById);

module.exports = router;
