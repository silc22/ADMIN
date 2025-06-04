const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es obligatorio.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Formato de email inválido.'],
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria.'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres.']
  },
  nombre: {
    type: String,
    trim: true,
    maxlength: [50, 'El nombre no puede superar 50 caracteres.']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

// Antes de guardar, hashear la contraseña si es nueva o modificada
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método para comparar contraseña en login
UserSchema.methods.matchPassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
