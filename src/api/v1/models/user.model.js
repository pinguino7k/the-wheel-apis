// Modelo de la coleccion users / tabla zt_usuarios (usuarios que inician sesion)
// Los usuarios se crearon en la actividad de GraphQL; aqui solo se consultan para el login.
const mongoose = require('mongoose');
const { detailRowSchema } = require('./detailRow.schema');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    usuario: { type: String, required: true, unique: true, uppercase: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // hash de bcrypt
    rol: { type: String, enum: ['ADMIN', 'TRADER', 'CONSULTA'], default: 'TRADER' },
    DETAIL_ROW: { type: detailRowSchema }
  },
  { collection: 'users', versionKey: false }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

// En Supabase la tabla zt_usuarios usa nombres en espanol (password_hash, activo, eliminado)
const table = { name: 'zt_usuarios', key: 'email' };

module.exports = { Model: User, table, keyField: 'email' };
