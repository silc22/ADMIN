require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear JSON en el body de las peticiones

// Conexión a MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/presupuestos_db';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✓ Conectado a MongoDB'))
  .catch(err => console.error('✗ Error conectando a MongoDB:', err));

// Rutas
app.use('/api/presupuestos', require('./routes/presupuestoRoutes'));

// Ruta de prueba básica
app.get('/', (req, res) => {
  res.send('API de Presupuestos funcionando');
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
