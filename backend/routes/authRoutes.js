const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const {
  registrarUsuario,
  loginUsuario,
  getUsuarioActual
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Debes proporcionar un email válido.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres.'),
    body('nombre')
      .optional({ checkFalsy: true })
      .isLength({ max: 50 })
      .withMessage('El nombre no puede superar 50 caracteres.')
  ],
  registrarUsuario
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Debes proporcionar un email válido.'),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es obligatoria.')
  ],
  loginUsuario
);

// GET /api/auth/me  (para obtener datos del usuario actual; ruta protegida)
router.get('/me', authMiddleware, getUsuarioActual);

module.exports = router;
