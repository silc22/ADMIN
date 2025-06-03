const Presupuesto = require('../models/Presupuesto');

// Listar todos los presupuestos
exports.obtenerPresupuestos = async (req, res) => {
  try {
    const presupuestos = await Presupuesto.find().sort({ fechaCreacion: -1 });
    res.json(presupuestos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener presupuestos' });
  }
};

// Obtener un presupuesto por id
exports.obtenerPresupuestoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = await Presupuesto.findById(id);
    if (!presupuesto) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }
    res.json(presupuesto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el presupuesto' });
  }
};

// Crear un nuevo presupuesto
exports.crearPresupuesto = async (req, res) => {
  try {
    const { titulo, cliente, descripcion, monto, estado } = req.body;
    const nuevoPresupuesto = new Presupuesto({ titulo, cliente, descripcion, monto, estado });
    const presupuestoGuardado = await nuevoPresupuesto.save();
    res.status(201).json(presupuestoGuardado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear presupuesto' });
  }
};

// Actualizar un presupuesto existente
exports.actualizarPresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, cliente, descripcion, monto, estado } = req.body;
    const presupuestoActualizado = await Presupuesto.findByIdAndUpdate(
      id,
      { titulo, cliente, descripcion, monto, estado },
      { new: true, runValidators: true }
    );
    if (!presupuestoActualizado) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }
    res.json(presupuestoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar presupuesto' });
  }
};

// Eliminar un presupuesto
exports.eliminarPresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Presupuesto.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }
    res.json({ mensaje: 'Presupuesto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar presupuesto' });
  }
};
