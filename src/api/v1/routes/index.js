// Indice de rutas de la version 1 de la API (submodulo The Wheel del modulo Inversiones).
// Todas las rutas, excepto el login, piden el token y operan con la base de
// datos (MongoDB o Supabase) elegida al iniciar sesion.
const { Router } = require('express');
const config = require('../../../config/config');
const { authenticate } = require('../../../middlewares/auth.middleware');

const authRoutes = require('./auth.routes');
const activeWheelRoutes = require('./activeWheel.routes');
const marketAnalysisRoutes = require('./marketAnalysis.routes');
const marketIndexRoutes = require('./marketIndex.routes');
const newsSentimentRoutes = require('./newsSentiment.routes');
const wheelConfigRoutes = require('./wheelConfig.routes');
const tradeValidationRoutes = require('./tradeValidation.routes');

const routerAPI = (app) => {
  const router = Router();
  app.use(config.API_URL, router);

  router.use('/auth', authRoutes);
  router.use('/active-wheels', authenticate, activeWheelRoutes);
  router.use('/market-analysis', authenticate, marketAnalysisRoutes);
  router.use('/market-indices', authenticate, marketIndexRoutes);
  router.use('/news-sentiment', authenticate, newsSentimentRoutes);
  router.use('/wheel-config', authenticate, wheelConfigRoutes);
  router.use('/trade-validations', authenticate, tradeValidationRoutes);

  return router;
};

module.exports = routerAPI;
