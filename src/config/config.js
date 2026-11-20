// Carga de variables de entorno del microservicio
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

// Bases de datos que puede elegir el usuario al iniciar sesion
const DB_SERVERS = ['MongoDB', 'Supabase'];

module.exports = {
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3020,
  API_URL: process.env.API_URL || '/api/v1',

  // NoSQL: MongoDB (local o Atlas)
  CONNECTION_STRING: process.env.CONNECTION_STRING || 'mongodb://localhost:27017',
  DATABASE: process.env.DATABASE || 'the_wheel',

  // SQL: Supabase (PostgreSQL)
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',

  // Sesion
  JWT_SECRET: process.env.JWT_SECRET || 'the-wheel-secreto-de-desarrollo',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '8h',
  DB_SERVERS,
  DB_DEFAULT: DB_SERVERS.includes(process.env.DB_DEFAULT) ? process.env.DB_DEFAULT : 'MongoDB',

  DEFAULT_REGUSER: process.env.DEFAULT_REGUSER || 'SYSTEM'
};
