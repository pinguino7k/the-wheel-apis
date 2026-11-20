// Servicio de inicio de sesion: valida el usuario en la base elegida
// (MongoDB o Supabase) y genera el token con esa eleccion.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../../config/config');
const httpError = require('../../../helpers/httpError');
const { isMongoReady } = require('../../../config/mongo.config');
const { getSupabase } = require('../../../config/supabase.config');
const { Model: User } = require('../models/user.model');

// Busca el usuario por email en MongoDB (coleccion users)
const findUserMongo = async (email) => {
  if (!isMongoReady()) throw httpError(503, 'MongoDB no esta conectado');
  const user = await User.findOne({ email }).lean();
  if (!user) return null;
  const detail = user.DETAIL_ROW || {};
  return {
    usuario: user.usuario,
    nombre: `${user.nombre} ${user.apellido}`,
    email: user.email,
    rol: user.rol,
    hash: user.password,
    activo: detail.ACTIVED !== false && detail.DELETED !== true
  };
};

// Busca el usuario por email en Supabase (tabla zt_usuarios)
const findUserSupabase = async (email) => {
  const sb = getSupabase();
  if (!sb) throw httpError(503, 'Supabase no esta conectado');
  const { data, error } = await sb.from('zt_usuarios').select('*').eq('email', email).maybeSingle();
  if (error) throw httpError(400, `Supabase: ${error.message}`);
  if (!data) return null;
  return {
    usuario: data.usuario,
    nombre: `${data.nombre} ${data.apellido}`,
    email: data.email,
    rol: data.rol,
    hash: data.password_hash,
    activo: data.activo !== false && data.eliminado !== true
  };
};

const login = async ({ email, password, dbServer } = {}) => {
  if (!email || !password) throw httpError(400, 'Los campos email y password son obligatorios');
  const server = dbServer || config.DB_DEFAULT;
  if (!config.DB_SERVERS.includes(server)) {
    throw httpError(400, `dbServer no valido: ${server}. Use ${config.DB_SERVERS.join(' o ')}`);
  }

  const finder = server === 'MongoDB' ? findUserMongo : findUserSupabase;
  const user = await finder(String(email).toLowerCase().trim());
  if (!user || !user.activo) throw httpError(401, 'Usuario o contrasena incorrectos');
  const ok = await bcrypt.compare(password, user.hash || '');
  if (!ok) throw httpError(401, 'Usuario o contrasena incorrectos');

  const payload = { usuario: user.usuario, nombre: user.nombre, email: user.email, rol: user.rol, dbServer: server };
  const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES });
  return { token, expiresIn: config.JWT_EXPIRES, user: payload };
};

module.exports = { login };
