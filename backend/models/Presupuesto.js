const mongoose = require('mongoose');
const Counter = require('./Counter');

const PresupuestoSchema = new mongoose.Schema({
  identifier: {
    type: Number,
    unique: true
  },
  titulo: {
    type: String,
    trim: true,
    default: '',
    minlength: [2, 'El título debe tener al menos 2 caracteres.'],
    maxlength: [100, 'El título no puede superar 100 caracteres.']
  },
  cliente: {
    type: String,
    required: [true, 'El campo cliente es obligatorio.'],
    trim: true,
    minlength: [3, 'El cliente debe tener al menos 3 caracteres.'],
    maxlength: [100, 'El cliente no puede superar 100 caracteres.']
  },
  descripcion: {
    type: String,
    default: '',
    maxlength: [500, 'La descripción no puede superar 500 caracteres.']
  },
  monto: {
    type: Number,
    required: [true, 'El campo monto es obligatorio.'],
    min: [0, 'El monto no puede ser negativo.']
  },
  estado: {
    type: String,
    enum: {
      values: ['pendiente', 'aprobado', 'rechazado'],
      message: 'Estado inválido.'
    },
    default: 'pendiente'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  archivo: {
    originalName: { type: String },  // nombre original del fichero
    filename: { type: String },      // nombre interno en servidor
    mimeType: { type: String },      // tipo MIME (p. ej. "application/pdf")
    size: { type: Number },          // tamaño en bytes
    url: { type: String }            // ruta pública para descargar
  }
});

// Hook pre-save: si es nuevo, incrementamos el contador y asignamos identifier = seq
PresupuestoSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Buscar o crear el contador "presupuestoId" y aumentarlo en 1
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'presupuestoId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      // Asignar identifier como número (1, 2, 3, …)
      this.identifier = counter.seq;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Presupuesto', PresupuestoSchema);
