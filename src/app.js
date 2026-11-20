// Configuracion principal de la aplicacion Express
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/config');
const routerAPI = require('./api/v1/routes');
const swaggerSpec = require('./swagger/swagger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Estado del microservicio
app.get('/', (req, res) => {
  res.json({
    service: 'The Wheel - Inversiones',
    framework: 'Express/NodeJS',
    databases: config.DB_SERVERS,
    api: config.API_URL,
    docs: '/api-docs'
  });
});

// Documentacion Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// Rutas de la API
routerAPI(app);

// Errores
app.use(notFound);
app.use(errorHandler);

module.exports = app;
