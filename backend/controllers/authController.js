const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

exports.registrarUsuario = async (req, res) => {
  // Validar inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, nombre } = req.body;
  try {
    // Verificar si ya existe el email
    let usuario = await User.findOne({ email });
    if (usuario) {
      return res.status(400).json({ errors: [{ msg: 'El email ya está registrado.' }] });
    }
    usuario = new User({ email, password, nombre });
    await usuario.save();

    // Generar token
    const token = generarToken(usuario._id);
    res.status(201).json({
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre
      }
    });
  } catch (error) {
    console.error('ERROR en registrarUsuario:', error);
    res.status(500).json({ errors: [{ msg: 'Error del servidor.' }] });
  }
};

exports.loginUsuario = async (req, res) => {
  // Validar inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ errors: [{ msg: 'Email o contraseña incorrectos.' }] });
    }
    const esMatch = await usuario.matchPassword(password);
    if (!esMatch) {
      return res.status(400).json({ errors: [{ msg: 'Email o contraseña incorrectos.' }] });
    }
    const token = generarToken(usuario._id);
    res.json({
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre
      }
    });
  } catch (error) {
    console.error('ERROR en loginUsuario:', error);
    res.status(500).json({ errors: [{ msg: 'Error del servidor.' }] });
  }
};

// Para obtener datos del usuario autenticado (opcional)
exports.getUsuarioActual = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id).select('-password');
    res.json({ usuario });
  } catch (error) {
    console.error('ERROR en getUsuarioActual:', error);
    res.status(500).json({ errors: [{ msg: 'Error del servidor.' }] });
  }
};
