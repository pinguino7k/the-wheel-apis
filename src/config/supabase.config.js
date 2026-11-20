// Conexion a la base de datos SQL: Supabase (PostgreSQL) con supabase-js
const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

let client = null;

const connectSupabase = async () => {
  if (!config.SUPABASE_URL || !config.SUPABASE_KEY) {
    console.log('Supabase no configurado (faltan SUPABASE_URL y SUPABASE_KEY)');
    return false;
  }
  client = createClient(config.SUPABASE_URL, config.SUPABASE_KEY, {
    auth: { persistSession: false }
  });
  // Consulta de prueba para confirmar que la llave y las tablas son correctas
  const { error } = await client.from('zt_active_wheels').select('wheel_id').limit(1);
  if (error) {
    console.error('Error al conectar con Supabase:', error.message);
    return false;
  }
  console.log(`Supabase conectado: ${config.SUPABASE_URL}`);
  return true;
};

const getSupabase = () => client;

// Solo para las pruebas automaticas: permite usar un cliente simulado
const setSupabaseClient = (fake) => { client = fake; };

module.exports = { connectSupabase, getSupabase, setSupabaseClient };
