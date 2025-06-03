const Presupuesto = require('../models/Presupuesto');
const fs = require('fs');
const path = require('path');

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
    // OJO: campos llegan de FormData, traerán strings (monto como string, removeFile como 'true'/'false')
    const { titulo, cliente, descripcion, monto, estado, removeFile } = req.body;

    const presupuesto = await Presupuesto.findById(id);
    if (!presupuesto) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }

    // Si el usuario marcó “Eliminar archivo actual”
    const shouldRemove = removeFile === 'true' || removeFile === true;
    if (shouldRemove) {
      if (presupuesto.archivo && presupuesto.archivo.filename) {
        const oldPath = path.join(__dirname, '..', 'uploads', presupuesto.archivo.filename);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      // Borrar la referencia en la base (dejamos el campo sin datos)
      presupuesto.archivo = undefined;
    }

    // Si llegó un nuevo archivo, reemplazamos (y antes borramos el viejo)
    if (req.file) {
      if (presupuesto.archivo && presupuesto.archivo.filename) {
        const oldPath = path.join(__dirname, '..', 'uploads', presupuesto.archivo.filename);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      presupuesto.archivo = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      };
    }

    // Actualizar campos de texto/números (monto convertir a Number)
    presupuesto.titulo = titulo;
    presupuesto.cliente = cliente;
    presupuesto.descripcion = descripcion;
    presupuesto.monto = Number(monto);
    presupuesto.estado = estado;

    const actualizado = await presupuesto.save();
    res.json(actualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar presupuesto' });
  }
};

// Eliminar un presupuesto
exports.eliminarPresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    // Primero, buscar para saber si existía archivo
    const presupuesto = await Presupuesto.findById(id);
    if (!presupuesto) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }

    // Si tenía un archivo adjunto, borrarlo del disco
    if (presupuesto.archivo && presupuesto.archivo.filename) {
      const filePath = path.join(__dirname, '..', 'uploads', presupuesto.archivo.filename);
      // Verificar que realmente exista
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Ahora sí borramos el documento
    await Presupuesto.findByIdAndDelete(id);
    res.json({ mensaje: 'Presupuesto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar presupuesto' });
  }
};
