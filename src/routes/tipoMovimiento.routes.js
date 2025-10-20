const express = require('express');
const router = express.Router();
const {
    getTipos,
    createTipo,
    updateTipo,
    deleteTipo,
} = require('../controllers/tipoMovimiento.controller');
const { authRequired } = require('../middleware/auth');
const { adminAuthRequired } = require('../middleware/adminAuth');

/**
 * @swagger
 * tags:
 *   name: Tipos de Movimiento
 *   description: API para gestionar los tipos de movimiento de inventario (Admin Only)
 */

/**
 * @swagger
 * /api/tipos-movimiento:
 *   get:
 *     summary: Obtiene todos los tipos de movimiento
 *     tags: [Tipos de Movimiento]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de movimiento
 */
router.get('/', authRequired, adminAuthRequired, getTipos);

/**
 * @swagger
 * /api/tipos-movimiento:
 *   post:
 *     summary: Crea un nuevo tipo de movimiento
 *     tags: [Tipos de Movimiento]
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
 *         description: Tipo de movimiento creado
 */
router.post('/', authRequired, adminAuthRequired, createTipo);

/**
 * @swagger
 * /api/tipos-movimiento/{id}:
 *   put:
 *     summary: Actualiza un tipo de movimiento existente
 *     tags: [Tipos de Movimiento]
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
 *         description: Tipo de movimiento actualizado
 *       404:
 *         description: Tipo de movimiento no encontrado
 */
router.put('/:id', authRequired, adminAuthRequired, updateTipo);

/**
 * @swagger
 * /api/tipos-movimiento/{id}:
 *   delete:
 *     summary: Elimina un tipo de movimiento
 *     tags: [Tipos de Movimiento]
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
 *         description: Tipo de movimiento eliminado
 *       404:
 *         description: Tipo de movimiento no encontrado
 */
router.delete('/:id', authRequired, adminAuthRequired, deleteTipo);

module.exports = router;
