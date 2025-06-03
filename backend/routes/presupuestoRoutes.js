// backend/routes/presupuestoRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');

module.exports = (upload) => {
  // Importamos las funciones del controlador
  const {
    obtenerPresupuestos,
    obtenerPresupuestoPorId,
    crearPresupuesto,
    actualizarPresupuesto,
    eliminarPresupuesto
  } = require('../controllers/presupuestoController');

  // GET /api/presupuestos        ⇒ Listar todos (sin adjunto)
  router.get('/', obtenerPresupuestos);

  // GET /api/presupuestos/:id    ⇒ Obtener uno (incluyendo info de archivo)
  router.get('/:id', obtenerPresupuestoPorId);

  // POST /api/presupuestos       ⇒ Crear nuevo (admite archivo único en “archivo”)
  router.post('/', upload.single('archivo'), (req, res, next) => {
  // Si Multer detectó un archivo muy grande, llega aquí un error con code === 'LIMIT_FILE_SIZE'
  // El manejador de errores general de Express debería capturarlo. Si quieres personalizar:
  // next(new Error('El archivo es demasiado grande. Tamaño máximo 5 MB.'));
  crearPresupuesto(req, res); // tu función normalmente
});

  // PUT /api/presupuestos/:id    ⇒ Actualizar (admite reemplazar/añadir archivo)
  router.put('/:id', upload.single('archivo'), actualizarPresupuesto);

  // DELETE /api/presupuestos/:id ⇒ Eliminar
  router.delete('/:id', eliminarPresupuesto);

  return router;
};
