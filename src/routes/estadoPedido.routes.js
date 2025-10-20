const express = require('express');
const router = express.Router();
const {
    getEstados,
    createEstado,
    updateEstado,
    deleteEstado,
} = require('../controllers/estadoPedido.controller');
const { authRequired } = require('../middleware/auth');
const { adminAuthRequired } = require('../middleware/adminAuth');

/**
 * @swagger
 * tags:
 *   name: Estados de Pedido
 *   description: API para gestionar los estados de los pedidos (Admin Only)
 */

/**
 * @swagger
 * /api/estados-pedido:
 *   get:
 *     summary: Obtiene todos los estados de pedido
 *     tags: [Estados de Pedido]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estados de pedido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (no es admin)
 */
router.get('/', authRequired, adminAuthRequired, getEstados);

/**
 * @swagger
 * /api/estados-pedido:
 *   post:
 *     summary: Crea un nuevo estado de pedido
 *     tags: [Estados de Pedido]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Estado de pedido creado
 *       400:
 *         description: Solicitud incorrecta
 */
router.post('/', authRequired, adminAuthRequired, createEstado);

/**
 * @swagger
 * /api/estados-pedido/{id}:
 *   put:
 *     summary: Actualiza un estado de pedido existente
 *     tags: [Estados de Pedido]
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
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado de pedido actualizado
 *       404:
 *         description: Estado de pedido no encontrado
 */
router.put('/:id', authRequired, adminAuthRequired, updateEstado);

/**
 * @swagger
 * /api/estados-pedido/{id}:
 *   delete:
 *     summary: Elimina un estado de pedido
 *     tags: [Estados de Pedido]
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
 *         description: Estado de pedido eliminado
 *       404:
 *         description: Estado de pedido no encontrado
 */
router.delete('/:id', authRequired, adminAuthRequired, deleteEstado);

module.exports = router;
