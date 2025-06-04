const Presupuesto = require('../models/Presupuesto');
const Counter = require('../models/Counter');
const fs = require('fs');
const path = require('path');

// Listar todos los presupuestos
exports.obtenerPresupuestos = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10) < 1 ? 1 : parseInt(page, 10);
    const limitNum = parseInt(limit, 10) < 1 ? 10 : parseInt(limit, 10);

    let filtro = {};

    if (q && q.trim() !== '') {
      const texto = q.trim();
      const regexp = new RegExp(texto, 'i');

      // Intentar parsear texto a entero para "identifier"
      const qInt = parseInt(texto, 10);
      const buscarPorIdentifier = !isNaN(qInt);

      // Armar el array de condiciones para $or
      const condiciones = [
        { titulo: regexp },
        { cliente: regexp },
        { descripcion: regexp },
        { estado: regexp }
      ];

      if (buscarPorIdentifier) {
        condiciones.push({ identifier: qInt });
      }

      filtro = { $or: condiciones };
    }

     // Contar total de documentos que coinciden
    const totalCount = await Presupuesto.countDocuments(filtro);

    // Calcular cuántas páginas hay en total
    const totalPages = Math.ceil(totalCount / limitNum);

    // Calcular skip
    const skip = (pageNum - 1) * limitNum;

    // Hacer la consulta paginada
    const presupuestos = await Presupuesto.find(filtro)
      .sort({ fechaCreacion: -1 })
      .skip(skip)
      .limit(limitNum);

    // Devolver resultados junto con metadatos de paginación
    res.json({
      data: presupuestos,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        perPage: limitNum
      }
    });
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
      owner: req.user.id, // <─ asignar owner
      titulo: titulo || '',
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
    // Si es un ValidationError de Mongoose:
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ errors: mensajes });
    }
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear presupuesto' });
  }
};

// Actualizar un presupuesto existente
exports.actualizarPresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, cliente, descripcion, monto, estado, removeFile } = req.body;

    const presupuesto = await Presupuesto.findById(id);
    if (!presupuesto) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }

    // Si no es admin Y no es dueño, denegar
    if (req.user.role !== 'admin' && presupuesto.owner.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ msg: 'No autorizado.' }] });
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

     if (typeof titulo !== 'undefined') presupuesto.titulo = titulo;
    presupuesto.cliente = cliente;
    presupuesto.descripcion = descripcion;
    presupuesto.monto = Number(monto);
    presupuesto.estado = estado;

    const actualizado = await presupuesto.save();
    res.json(actualizado);
  } catch (error) {
    // Si es un ValidationError de Mongoose:
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ errors: mensajes });
    }
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar presupuesto' });
  }
};

// Eliminar un presupuesto
exports.eliminarPresupuesto = async (req, res) => {
   try {
    const { id } = req.params;
    // 1) Buscamos el presupuesto para extraer su identifier
    const presupuesto = await Presupuesto.findById(id);
    if (!presupuesto) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }

    const deletedIdentifier = presupuesto.identifier;

    // 2) Si tenía un archivo adjunto, lo borramos del disco
    if (presupuesto.archivo && presupuesto.archivo.filename) {
      const filePath = path.join(__dirname, '..', 'uploads', presupuesto.archivo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3) Eliminamos el documento
    await Presupuesto.findByIdAndDelete(id);

    // 4) Comprobamos cuántos presupuestos quedan
    const remainingCount = await Presupuesto.countDocuments();

    // 5) Obtenemos el documento del contador
    const counterDoc = await Counter.findById('presupuestoId');
    if (!counterDoc) {
      // Si el contador no existe, crearlo en 0 (no debería pasar, pero por si acaso)
      await Counter.create({ _id: 'presupuestoId', seq: 0 });
    } else {
      if (remainingCount === 0) {
        // Si ya no quedan presupuestos, reiniciar seq a 0
        counterDoc.seq = 0;
        await counterDoc.save();
      } else {
        // Si todavía hay presupuestos, solo decrementamos si borramos el último
        // (es decir, deletedIdentifier === counter.seq)
        if (deletedIdentifier === counterDoc.seq) {
          counterDoc.seq = counterDoc.seq - 1;
          await counterDoc.save();
        }
      }
    }

    res.json({ mensaje: 'Presupuesto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar presupuesto' });
  }
};
