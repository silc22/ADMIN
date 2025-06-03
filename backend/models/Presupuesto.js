// backend/models/Presupuesto.js
const mongoose = require('mongoose');

const PresupuestoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  cliente: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  monto: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
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

module.exports = mongoose.model('Presupuesto', PresupuestoSchema);
