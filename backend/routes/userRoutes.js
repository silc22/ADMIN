const express = require('express');
const { param, body, validationResult } = require('express-validator');
const router = express.Router();
const {
  obtenerUsuarios,
  actualizarRole,
  eliminarUsuario
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/roleMiddleware')('admin');

// GET /api/users  → solo admin
router.get('/', authMiddleware, requireAdmin, obtenerUsuarios);

// PUT /api/users/:id/role  → cambiar rol: solo admin
router.put(
  '/:id/role',
  authMiddleware,
  requireAdmin,
  [
    param('id', 'ID inválido').isMongoId(),
    body('role').notEmpty().withMessage('El rol es obligatorio.').isIn(['user', 'admin']).withMessage('Rol inválido.')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  actualizarRole
);

// DELETE /api/users/:id → eliminar usuario: solo admin
router.delete(
  '/:id',
  authMiddleware,
  requireAdmin,
  [param('id', 'ID inválido').isMongoId()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  eliminarUsuario
);

module.exports = router;
