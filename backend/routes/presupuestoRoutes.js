const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

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
  router.get(
    '/:id',
    [ param('id', 'ID inválido').isMongoId() ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      next();
    },
    obtenerPresupuestoPorId
  );

  // POST /api/presupuestos       ⇒ Crear nuevo (admite archivo único en “archivo”)
  router.post(
    '/',
    authMiddleware,
    upload.single('archivo'),
    [
      body('titulo')
        .optional({ checkFalsy: true })
        .isLength({ min: 2, max: 100 })
        .withMessage('El título debe tener entre 2 y 100 caracteres.'),
      body('cliente')
        .notEmpty()
        .withMessage('El cliente es obligatorio.')
        .isLength({ min: 3, max: 100 })
        .withMessage('El cliente debe tener entre 3 y 100 caracteres.'),
      body('descripcion')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar 500 caracteres.'),
      body('monto')
        .notEmpty()
        .withMessage('El monto es obligatorio.')
        .isFloat({ min: 0 })
        .withMessage('El monto debe ser un número mayor o igual a 0.'),
      body('estado')
        .notEmpty()
        .withMessage('El estado es obligatorio.')
        .isIn(['pendiente', 'aprobado', 'rechazado'])
        .withMessage('Estado inválido.'),
      // Para archivo, no usamos express-validator, sino Multer + validación en el controlador (o puedes chequear req.file.mimetype aquí)
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Si Multer detectó un error de tipo/tamaño de archivo, lo agregamos manualmente
        const multerError = req.fileValidationError;
        const arrayErrors = errors.array();
        if (multerError) {
          arrayErrors.push({ msg: multerError });
        }
        return res.status(400).json({ errors: arrayErrors });
      }
      next();
    },
    crearPresupuesto
  );

  // PUT /api/presupuestos/:id    ⇒ Actualizar (admite reemplazar/añadir archivo)
   router.put(
    '/:id',
    authMiddleware,
    upload.single('archivo'),
    [
      param('id', 'ID inválido').isMongoId(),
      body('titulo')
        .optional({ checkFalsy: true })
        .isLength({ min: 2, max: 100 })
        .withMessage('El título debe tener entre 2 y 100 caracteres.'),
      body('cliente')
        .notEmpty()
        .withMessage('El cliente es obligatorio.')
        .isLength({ min: 3, max: 100 })
        .withMessage('El cliente debe tener entre 3 y 100 caracteres.'),
      body('descripcion')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar 500 caracteres.'),
      body('monto')
        .notEmpty()
        .withMessage('El monto es obligatorio.')
        .isFloat({ min: 0 })
        .withMessage('El monto debe ser un número mayor o igual a 0.'),
      body('estado')
        .notEmpty()
        .withMessage('El estado es obligatorio.')
        .isIn(['pendiente', 'aprobado', 'rechazado'])
        .withMessage('Estado inválido.'),
      body('removeFile')
        .optional()
        .isBoolean()
        .withMessage('removeFile debe ser booleano.')
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const multerError = req.fileValidationError;
        const arrayErrors = errors.array();
        if (multerError) {
          arrayErrors.push({ msg: multerError });
        }
        return res.status(400).json({ errors: arrayErrors });
      }
      next();
    },
    actualizarPresupuesto
  );

  // DELETE /api/presupuestos/:id ⇒ Eliminar
 router.delete(
    '/:id',
    authMiddleware,
    [ param('id', 'ID inválido').isMongoId() ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      next();
    },
    eliminarPresupuesto
  );

  return router;
};
