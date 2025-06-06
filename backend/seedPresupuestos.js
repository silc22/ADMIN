/**
 * seedPresupuestos.js
 *
 * Inserta 100 documentos de ejemplo en la colección "presupuestos", 
 * todos con owner="6840c40b4fe8c91c1f1a9437".
 *
 * Para usarlo:
 *   1) Asegúrate de tener .env con MONGODB_URI correcto.
 *   2) Ejecuta: node seedPresupuestos.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// -------------- 1) Definir el esquema ---------------
const PresupuestoSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  identifier: {
    type: Number,
    unique: true
  },
  titulo: {
    type: String,
    trim: true,
    default: '',
    validate: {
      validator: function (value) {
        if (value === '') return true;
        return value.trim().length >= 2 && value.trim().length <= 100;
      },
      message: 'El título debe tener entre 2 y 100 caracteres.'
    }
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
  importe: {
    type: Number,
    required: [true, 'El campo importe es obligatorio.'],
    min: [0, 'El importe no puede ser negativo.']
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
    originalName: { type: String },
    filename: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    url: { type: String }
  }
});

const Presupuesto = mongoose.model('Presupuesto', PresupuestoSchema);

// -------------- 2) Conectar a MongoDB ---------------
async function conectarMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tu_basedatos';
  await mongoose.connect(uri);
  console.log('🔌 Conectado a MongoDB');
}

// -------------- 3) `owner` fijo para todos ---------------
const OWNER_ID = new mongoose.Types.ObjectId('6840c40b4fe8c91c1f1a9437');

// -------------- 4) Generar un presupuesto aleatorio ---------------
function crearPresupuestoDeEjemplo(numero) {
  const titulo =
    Math.random() < 0.5
      ? ''
      : faker.lorem.words(faker.number.int({ min: 2, max: 5 }));

  let cliente = faker.company.name();
  if (cliente.length > 100) cliente = cliente.slice(0, 100);

  const descripcion =
    Math.random() < 0.5
      ? ''
      : (() => {
          let text = faker.lorem.sentence(faker.number.int({ min: 5, max: 15 }));
          return text.length > 500 ? text.slice(0, 500) : text;
        })();

  const importe = parseFloat((Math.random() * 10000).toFixed(2));

  const estados = ['pendiente', 'aprobado', 'rechazado'];
  const estado = estados[faker.number.int({ min: 0, max: estados.length - 1 })];

  const unAnoAtras = new Date();
  unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
  const fechaCreacion = faker.date.between({ from: unAnoAtras, to: new Date() });

  const archivo = undefined;

  return {
    owner: OWNER_ID,
    identifier: numero,
    titulo,
    cliente,
    descripcion,
    importe,
    estado,
    fechaCreacion,
    archivo
  };
}

// -------------- 5) Insertar 100 documentos ---------------
async function seed() {
  try {
    await conectarMongo();

    await Presupuesto.deleteMany({});
    console.log('🗑️  Colección de presupuestos vaciada.');

    const docs = [];
    for (let i = 1; i <= 100; i++) {
      docs.push(crearPresupuestoDeEjemplo(i));
    }

    const inserted = await Presupuesto.insertMany(docs);
    console.log(`✅ Se insertaron ${inserted.length} presupuestos de ejemplo.`);
  } catch (err) {
    console.error('❌ Error al insertar presupuestos de ejemplo:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

if (require.main === module) {
  seed();
}

