const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  // Se espera que el token venga en el header Authorization: "Bearer <token>"
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ errors: [{ msg: 'No autorizado: token faltante.' }] });
  }

  const token = authHeader.split(' ')[1].trim();
  if (!token) {
    return res.status(401).json({ errors: [{ msg: 'No autorizado: token faltante.' }] });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: <userId>, iat: <timestamp>, exp: <timestamp> }
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error('ERROR en authMiddleware:', error);
    return res.status(401).json({ errors: [{ msg: 'Token inválido o expirado.' }] });
  }
};
