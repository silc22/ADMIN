// backend/middleware/roleMiddleware.js
module.exports = function(requiredRole) {
  return (req, res, next) => {
    // authMiddleware ya guardó req.user.id
    if (!req.user || !req.user.id) {
      return res.status(401).json({ errors: [{ msg: 'No autorizado.' }] });
    }
    const User = require('../models/User');
    User.findById(req.user.id)
      .then(user => {
        if (!user || user.role !== requiredRole) {
          return res.status(403).json({ errors: [{ msg: 'Acceso restringido: solo administradores.' }] });
        }
        next();
      })
      .catch(err => {
        console.error('Error en roleMiddleware:', err);
        return res.status(500).json({ errors: [{ msg: 'Error interno.' }] });
      });
  };
};
