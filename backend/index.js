require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Counter = require('./models/Counter');
const Presupuesto = require('./models/Presupuesto');


const app = express();



// 1) Definir y crear, si no existe, la carpeta “uploads”
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}



// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear JSON en el body de las peticiones


// 3) Configurar carpeta “uploads” para servir archivos estáticos
//    (si la guardas en backend/uploads)
app.use('/uploads', express.static(uploadsDir, {
  extensions: false,
  index: false,
  dotfiles: 'ignore', 
  setHeaders: (res, path) => {
    // Por ejemplo, evitar que se interprete como HTML
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));


// Opciones de almacenamiento en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); 
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});


const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      // Almacenar mensaje en req.fileValidationError
      req.fileValidationError = 'Tipo de archivo no soportado. Solo PDF, JPG, PNG.';
      return cb(null, false);
    } 
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});


// 4) Rutas
app.use('/api/presupuestos', require('./routes/presupuestoRoutes')(upload) );
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// 5) Ruta de prueba
// app.get('/', (req, res) => {
//   res.send('API de Presupuestos con adjuntos funcionando');
// });

app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ mensaje: 'El archivo supera el tamaño máximo (5 MB).' });
  }
  if (error.message === 'Tipo de archivo no soportado') {
    return res.status(400).json({ mensaje: error.message });
  }
  // Otros errores:
  res.status(500).json({ mensaje: error.message || 'Error interno del servidor.' });
});


async function syncCounter() {
  // 1) Busca el máximo identifier en presupuestos
  const last = await Presupuesto.findOne().sort({ identifier: -1 }).select('identifier');
  const maxIdentifier = last ? last.identifier : 0;

  // 2) Actualiza (o crea) el documento de Counter
  await Counter.findByIdAndUpdate(
    'presupuestoId',
    { seq: maxIdentifier },
    { upsert: true }
  );

  console.log(`🔄 Counter sincronizado a seq = ${maxIdentifier}`);
}


// Conexión a MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/presupuestos_db';
const PORT = process.env.PORT

mongoose
  .connect(mongoURI)                // puedes quitar las opciones obsoletas
  .then(async () => {
    console.log('🔌 Conectado a MongoDB');
    await syncCounter();
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })                               // <-- CIERRE del then
  .catch(error => {
    console.error('✗ Error conectando a MongoDB:', error);
    process.exit(1);
  });



