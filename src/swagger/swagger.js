// Documentacion OpenAPI (Swagger) generada a partir del catalogo de APIs
const config = require('../config/config');
const { modules, buildEndpoints } = require('../api/v1/catalog');

const toOpenApiPath = (path) => path.replace(/:([A-Za-z]+)/g, '{$1}');

const buildSpec = () => {
  const paths = {};
  buildEndpoints().forEach((e) => {
    const p = toOpenApiPath(e.path);
    const params = [...e.path.matchAll(/:([A-Za-z]+)/g)].map(([, name]) => ({
      in: 'path', name, required: true, schema: { type: 'string' }
    }));
    const mod = modules.find((m) => m.tag === e.tag);
    if (mod && e.op === 'list') {
      mod.filters.forEach((f) => params.push({ in: 'query', name: f.name, schema: { type: 'string', enum: f.enum }, description: f.example ? `Opcional. Ejemplo: ${f.example}` : 'Opcional' }));
      params.push({ in: 'query', name: 'includeDeleted', schema: { type: 'boolean' }, description: 'true incluye los registros con borrado logico' });
    }
    if (e.op === 'delete' || e.op === 'deleteMany') {
      params.push({ in: 'query', name: 'type', schema: { type: 'string', enum: ['logical', 'physical'], default: 'logical' } });
    }
    const op = {
      tags: [e.tag],
      summary: e.description,
      description: `Request: ${e.headers}. Response: ${e.response}`,
      parameters: params,
      responses: { 200: { description: 'OK' }, 201: { description: 'Creado' }, 400: { description: 'Datos invalidos' }, 401: { description: 'Sin token' }, 404: { description: 'No existe' } }
    };
    if (e.bodyExample !== undefined) {
      op.requestBody = { required: true, content: { 'application/json': { schema: { type: Array.isArray(e.bodyExample) ? 'array' : 'object' }, example: e.bodyExample } } };
    }
    if (e.noAuth) op.security = [];
    paths[p] = paths[p] || {};
    paths[p][e.method.toLowerCase()] = op;
  });

  return {
    openapi: '3.0.3',
    info: {
      title: 'The Wheel - APIs RESTful (Express/NodeJS)',
      version: '2.0.0',
      description: 'Submodulo The Wheel del modulo Inversiones. Primero ejecute POST /auth/login, copie el token y presione Authorize. Todas las APIs operan con la base de datos elegida al iniciar sesion (MongoDB o Supabase).'
    },
    servers: [{ url: `http://${config.HOST}:${config.PORT}${config.API_URL}` }],
    tags: [{ name: 'Auth', description: 'Inicio de sesion y seleccion de base de datos' },
      ...modules.map((m) => ({ name: m.tag, description: `${m.name} (coleccion ${m.collection} / tabla ${m.table})` }))],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    security: [{ bearerAuth: [] }],
    paths
  };
};

module.exports = buildSpec();