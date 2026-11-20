// Verifica el JSON Web Token y deja en req.auth el usuario y la base de datos
// que eligio al iniciar sesion (MongoDB o Supabase).
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticate = (req, res, next) => {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.substring(7) : header;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Falta el token. Inicie sesion en POST /auth/login' });
  }
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.auth = {
      user: payload.usuario,
      rol: payload.rol,
      dbServer: payload.dbServer
    };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: `Token no valido: ${error.message}` });
  }
};

module.exports = { authenticate };
