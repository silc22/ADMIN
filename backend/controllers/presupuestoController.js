const Presupuesto = require('../models/Presupuesto');

// Listar todos los presupuestos
exports.obtenerPresupuestos = async (req, res) => {
  try {
    const { q } = req.query;
    let filtro = {};

    if (q && q.trim() !== '') {
      const regexp = new RegExp(q.trim(), 'i');
      filtro = {
        $or: [
          { titulo: regexp },
          { cliente: regexp },
          { descripcion: regexp },
          { estado: regexp }
        ]
      };
    }

    const presupuestos = await Presupuesto.find(filtro).sort({ fechaCreacion: -1 });
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
    // Campos del body (titúlo, cliente, descripción, monto, estado)
    const { titulo, cliente, descripcion, monto, estado } = req.body;

    // Construir nuevo objeto Presupuesto
    const nuevoPresupuesto = new Presupuesto({
      titulo,
      cliente,
      descripcion,
      monto,
      estado
    });

    // Si llega archivo en req.file, lo guardamos en el campo “archivo”
    if (req.file) {
      nuevoPresupuesto.archivo = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        // La URL pública para servirlo será: /uploads/<filename>
        url: `/uploads/${req.file.filename}`
      };
    }

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
    // Buscar el presupuesto existente
    const presupuestoExistente = await Presupuesto.findById(id);
    if (!presupuestoExistente) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }

    // Actualizar campos
    presupuestoExistente.titulo = titulo;
    presupuestoExistente.cliente = cliente;
    presupuestoExistente.descripcion = descripcion;
    presupuestoExistente.monto = monto;
    presupuestoExistente.estado = estado;

    // Si hay un nuevo archivo, reemplazar o añadir
    if (req.file) {
      // (Opcional: podrías borrar el archivo viejo del disco aquí)

      presupuestoExistente.archivo = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      };
    }

    const presupuestoActualizado = await presupuestoExistente.save();
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
