const express = require('express');
const router = express.Router();
const { createPedido, updatePedidoEstado } = require('../controllers/pedido.controller');
const { authRequired } = require('../middleware/auth');
const { adminAuthRequired } = require('../middleware/adminAuth');

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Manegador de pedidos en el sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Pedido:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         estadoId:
 *           type: integer
 *         total:
 *           type: number
 *           format: double
 *         comision:
 *           type: number
 *           format: double
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PedidoItem'
 *     PedidoItem:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          productoId:
 *            type: integer
 *          cantidad:
 *            type: integer
 *          precio:
 *            type: number
 *            format: double
 *          subtotal:
 *            type: number
 *            format: double
 */

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Create a new order
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
 *     summary: Update the status of an order (Admin only)
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
 *                 description: The ID of the new status (e.g., 2 for CONFIRMADO, 3 for ENTREGADO)
 *             example:
 *               estadoId: 2
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: Bad request (e.g., invalid status ID, order not found)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not an admin)
 *       404:
 *         description: Order not found
 */
router.put('/:id/estado', authRequired, adminAuthRequired, updatePedidoEstado);

module.exports = router;
