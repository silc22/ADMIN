const mongoose = require('mongoose');

// Un contador genérico: cada documento en esta colección representará un contador distinto
// Para nosotros usaremos un único documento cuyo _id sea "presupuestoId"
const CounterSchema = new mongoose.Schema({
  _id: {          // nombre del contador (por ej. "presupuestoId")
    type: String,
    required: true
  },
  seq: {          // valor numérico actual del contador
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Counter', CounterSchema);
