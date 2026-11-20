// Elige el repositorio (MongoDB o Supabase) segun la base de datos
// que el usuario selecciono al iniciar sesion.
const httpError = require('../../../helpers/httpError');
const mongoRepository = require('./mongo.repository');
const supabaseRepository = require('./supabase.repository');

const getRepository = (dbServer, modelDef) => {
  if (dbServer === 'MongoDB') return mongoRepository(modelDef);
  if (dbServer === 'Supabase') return supabaseRepository(modelDef);
  throw httpError(400, `Base de datos no valida: ${dbServer}. Use MongoDB o Supabase`);
};

module.exports = { getRepository };
