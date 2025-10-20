const express = require('express');
const router = express.Router();
const { createPedido, updatePedidoEstado } = require('../controllers/pedido.controller');
const { authRequired } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Manegador de pedidos en el sistema
 */


/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Create una nueva orden
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productoId:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *             example:
 *               items:
 *                 - productoId: 1
 *                   cantidad: 2
 *                 - productoId: 5
 *                   cantidad: 1
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: Bad request (e.g., product not found, not enough stock)
 *       401:
 *         description: Unauthorized
 */
router.post('/', authRequired, createPedido);

/**
 * @swagger
 * /api/pedidos/{id}/estado:
 *   put:
 *     summary: Actualizar el estado de un pedido (Admin o Proveedor)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estadoId:
 *                 type: integer
 *                 description: El ID de un nuevo estado
 *             example:
 *               estadoId: 2
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user is not the owner provider or not an admin)
 *       404:
 *         description: Order not found
 */
router.put('/:id/estado', authRequired, updatePedidoEstado);

module.exports = router;
