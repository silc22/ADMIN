// routes/presupuestoRoutes.js
const express = require('express');
const router = express.Router();
const {
  obtenerPresupuestos,
  obtenerPresupuestoPorId,
  crearPresupuesto,
  actualizarPresupuesto,
  eliminarPresupuesto
} = require('../controllers/presupuestoController');

// GET /api/presupuestos        ⇒ Listar todos
router.get('/', obtenerPresupuestos);

// GET /api/presupuestos/:id    ⇒ Obtener uno
router.get('/:id', obtenerPresupuestoPorId);

// POST /api/presupuestos       ⇒ Crear nuevo
router.post('/', crearPresupuesto);

// PUT /api/presupuestos/:id    ⇒ Actualizar
router.put('/:id', actualizarPresupuesto);

// DELETE /api/presupuestos/:id ⇒ Eliminar
router.delete('/:id', eliminarPresupuesto);

module.exports = router;
