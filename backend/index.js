require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Conexión a MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/presupuestos_db';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✓ Conectado a MongoDB'))
  .catch(err => console.error('✗ Error conectando a MongoDB:', err));

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear JSON en el body de las peticiones

// 3) Configurar carpeta “uploads” para servir archivos estáticos
//    (si la guardas en backend/uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4) Configurar Multer para manejar multipart/form-data
const multer = require('multer');

// Opciones de almacenamiento en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Carpeta donde se guardan los archivos; crea “backend/uploads” si no existe
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    // Generar un nombre único: timestamp + nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // p. ej. ".pdf"
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro de tipos de archivo (opcional: solo PDF, imágenes, etc.)
const fileFilter = (req, file, cb) => {
  // Por ejemplo, solo permitir PDF o imágenes
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no soportado'), false);
  }
};

// Límite de tamaño (p. ej. 5 MB)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 5) Rutas
//    Pasaremos `upload.single('archivo')` en aquellas rutas que admitan adjuntar archivo
app.use('/api/presupuestos', require('./routes/presupuestoRoutes')(upload));

// 6) Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Presupuestos con adjuntos funcionando');
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
