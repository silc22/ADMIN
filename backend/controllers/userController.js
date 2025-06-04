const User = require('../models/User');

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select('-password');
    res.json({ data: usuarios });
  } catch (err) {
    console.error('Error en obtenerUsuarios:', err);
    res.status(500).json({ errors: [{ msg: 'Error al obtener usuarios.' }] });
  }
};

exports.actualizarRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ errors: [{ msg: 'Rol inválido.' }] });
  }
  try {
    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ errors: [{ msg: 'Usuario no encontrado.' }] });
    }
    usuario.role = role;
    await usuario.save();
    res.json({ msg: 'Rol actualizado correctamente.', usuario: { id: usuario._id, email: usuario.email, role: usuario.role, nombre: usuario.nombre } });
  } catch (err) {
    console.error('Error en actualizarRole:', err);
    res.status(500).json({ errors: [{ msg: 'Error al actualizar rol.' }] });
  }
};

exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ errors: [{ msg: 'Usuario no encontrado.' }] });
    await User.findByIdAndDelete(id);
    res.json({ msg: 'Usuario eliminado.' });
  } catch (err) {
    console.error('Error en eliminarUsuario:', err);
    res.status(500).json({ errors: [{ msg: 'Error al eliminar usuario.' }] });
  }
};
