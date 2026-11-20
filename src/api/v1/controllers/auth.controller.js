// Controladores de inicio de sesion
const authService = require('../services/auth.service');
const { wrap } = require('./base.controller');

// POST /auth/login
const login = wrap(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, dbServer: result.user.dbServer, message: 'Sesion iniciada', data: result });
});

// GET /auth/me
const me = (req, res) => {
  res.status(200).json({ success: true, dbServer: req.auth.dbServer, message: 'Sesion activa', data: req.auth });
};

module.exports = { login, me };
