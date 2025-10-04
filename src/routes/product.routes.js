const express = require("express");
const { authRequired } = require("../middleware/auth");
const { providerAuthRequired } = require("../middleware/providerAuth");
const {
    list,
    listMyProducts,
    create,
    getById,
    update,
    remove
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
 *     summary: Listar productos activos
 *     description: Retorna solo productos con activo=true. Permite filtrar por proveedorId, categoria y busqueda.
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
 *     responses:
 *       200:
 *         description: Lista de productos activos
 */
// Rutas públicas (no requieren autenticación)
router.get("/", list);

// Rutas que requieren autenticación
router.use(authRequired);

// Rutas que requieren ser proveedor (registradas antes de ":id" para evitar colisiones)
router.get("/provider/my-products", providerAuthRequired, listMyProducts); // Listar productos del proveedor
router.post("/", providerAuthRequired, create);
router.put("/:id", providerAuthRequired, update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Inactivar un producto propio
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
 *       204:
 *         description: Producto inactivado correctamente (sin contenido)
 *       403:
 *         description: Sin permisos para inactivar
 *       404:
 *         description: Producto no encontrado
 */
router.delete("/:id", providerAuthRequired, remove);

// Detalle de producto por id (requiere autenticación pero no rol de proveedor)
router.get("/:id", getById);

module.exports = router;
