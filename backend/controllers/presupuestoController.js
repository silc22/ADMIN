const Presupuesto = require('../models/Presupuesto');
const Counter = require('../models/Counter');
const fs = require('fs');
const path = require('path');

// Listar todos los presupuestos
exports.obtenerPresupuestos = async (req, res) => {
  try {
    // 1) Extraer de req.query todos los posibles filtros
    let {
      q,
      page = 1,
      limit = 10,
      estado,
      cliente,
      minImporte,
      maxImporte,
      fechaDesde,
      fechaHasta
    } = req.query;

    // Convertir page y limit a número
    page = Number(page);
    limit = Number(limit);

    // 2) Construir un objeto "filtros" paso a paso
    const filtros = {};

    // Filtrar por estado exacto
    if (estado) {
      filtros.estado = estado;
    }

    // Filtrar por cliente (regex case-insensitive)
    if (cliente) {
      filtros.cliente = { $regex: cliente, $options: 'i' };
    }

    // Filtrar por rango de importe
    if (minImporte || maxImporte) {
      filtros.importe = {};
      if (minImporte) filtros.importe.$gte = parseFloat(minImporte);
      if (maxImporte) filtros.importe.$lte = parseFloat(maxImporte);
    }

    // Filtrar por rango de fechas (fechaCreacion)
    if (fechaDesde || fechaHasta) {
    filtros.fechaCreacion = {};

    if (fechaDesde && !isNaN(new Date(fechaDesde))) {
      // >= inicio de fechaDesde (00:00:00.000)
      filtros.fechaCreacion.$gte = new Date(fechaDesde);
    }

    if (fechaHasta && !isNaN(new Date(fechaHasta))) {
      // <= final de fechaHasta (23:59:59.999)
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      filtros.fechaCreacion.$lte = hasta;
    }

    // Si por alguna razón no quedó ninguna clave dentro de filtros.fechaCreacion, la eliminamos
    if (Object.keys(filtros.fechaCreacion).length === 0) {
      delete filtros.fechaCreacion;
    }
    }

    // 3) Filtrar “q” contra título, descripción, cliente y ahora también identifier
    if (q) {
      // 3.1) Crear un regex a partir de q (case-insensitive)
      const regex = new RegExp(q, 'i');

      // 3.2) Si q es solo dígitos, parsearlo a número
      const qNum = /^\d+$/.test(q) ? parseInt(q, 10) : null;

      // 3.3) Armar el array $or inicial (titulo, descripcion, cliente)
      filtros.$or = [
        { titulo:      { $regex: regex } },
        { descripcion: { $regex: regex } },
        { cliente:     { $regex: regex } }
      ];

      // 3.4) Si qNum no es null, añadir la comparación exacta de identifier
      if (qNum !== null) {
        filtros.$or.push({ identifier: qNum });
      }
    }

    // 4) Calcular cuántos documentos hay en total para paginar
    const totalDocs = await Presupuesto.countDocuments(filtros);

    // 5) Calcular skip y limit para la página actual
    const skip = (page - 1) * limit;

    // 6) Hacer la consulta con los filtros, orden, skip y limit
    const data = await Presupuesto.find(filtros)
      .sort({ identifier: -1 }) // opcional: ordenar por número descendente
      .skip(skip)
      .limit(limit);

    // 7) Devolver la respuesta con data y datos de paginación
    return res.json({
      data,
      pagination: {
        totalDocs,
        limit,
        page,
        totalPages: Math.ceil(totalDocs / limit)
      }
    });
  } catch (err) {
    console.error('Error en obtenerPresupuestos:', err);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

exports.getResumenPresupuestos = async (req, res) => {
  try {
    // 1) Reconstruimos el mismo filtro que en obtenerPresupuestos:
    const { q, estado, cliente, minImporte, maxImporte, fechaDesde, fechaHasta } = req.query;
    let filtro = {};
    if (q && q.trim() !== '') {
      const texto = q.trim();
      const regexp = new RegExp(texto, 'i');
      filtro.$or = [{ titulo: regexp }, { descripcion: regexp }];
    }
    if (estado && ['pendiente', 'aprobado', 'rechazado'].includes(estado)) {
      filtro.estado = estado;
    }
    if (cliente && cliente.trim() !== '') {
        filtro.cliente = new RegExp(cliente.trim(), 'i');
    }
    if (minImporte !== undefined || maxImporte !== undefined) {
      filtro.importe = {};
      if (minImporte !== undefined && !isNaN(parseFloat(minImporte))) {
        filtro.importe.$gte = parseFloat(minImporte);
      }
      if (maxImporte !== undefined && !isNaN(parseFloat(maxImporte))) {
        filtro.importe.$lte = parseFloat(maxImporte);
      }
      if (Object.keys(filtro.importe).length === 0) delete filtro.importe;
    }
    if ((fechaDesde && !isNaN(new Date(fechaDesde))) || (fechaHasta && !isNaN(new Date(fechaHasta)))) {
      filtro.fechaCreacion = {};
    if (fechaDesde && !isNaN(new Date(fechaDesde))) {
      filtro.fechaCreacion.$gte = new Date(fechaDesde);
    }
      if (fechaHasta && !isNaN(new Date(fechaHasta))) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        filtro.fechaCreacion.$lte = hasta;
      }
      if (Object.keys(filtro.fechaCreacion).length === 0) delete filtro.fechaCreacion;
    }

    // 2) Usar agregación de Mongo para agrupar por estado:
    const pipeline = [
      { $match: filtro },
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 },
          totalImporte: { $sum: '$importe' }
        }
      },
      {
        $project: {
          _id: 0,
          estado: '$_id',
          count: 1,
          totalImporte: 1
        }
      }
    ];

    const resumen = await Presupuesto.aggregate(pipeline);

    // 3) Asegurarnos de que todos los estados aparezcan (incluso con 0)
    const estadosPosibles = ['pendiente', 'aprobado', 'rechazado'];
    const resumenCompleto = estadosPosibles.map((e) => {
      const encontrado = resumen.find((r) => r.estado === e);
      return encontrado
        ? encontrado
        : { estado: e, count: 0, totalImporte: 0 };
    });

    return res.json({ summary: resumenCompleto });
  } catch (error) {
    console.error('Error en getResumenPresupuestos:', error);
    return res.status(500).json({ mensaje: 'Error al obtener resumen' });
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
    // Campos del body (titúlo, cliente, descripción, importe, estado)
    const { titulo, cliente, descripcion, importe, estado } = req.body;

    // Construir nuevo objeto Presupuesto
    const nuevoPresupuesto = new Presupuesto({
      owner: req.user.id, 
      titulo: titulo || '',
      cliente,
      descripcion,
      importe,
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
    const { titulo, cliente, descripcion, importe, estado, removeFile } = req.body;

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
    presupuesto.importe = Number(importe);
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
    
    // Si no es admin Y no es dueño, denegar
    if (req.user.role !== 'admin' && presupuesto.owner.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ msg: 'No autorizado.' }] });
    }
    
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
    const deletedIdentifier = presupuesto.identifier;
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

