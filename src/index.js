// Punto de entrada: conecta las bases de datos y levanta el servidor
const app = require('./app');
const config = require('./config/config');
const { connectMongo } = require('./config/mongo.config');
const { connectSupabase } = require('./config/supabase.config');

const start = async () => {
  const mongoOk = await connectMongo();
  const supabaseOk = await connectSupabase();
  if (!mongoOk && !supabaseOk) {
    console.error('No hay ninguna base de datos disponible. Revisa el archivo .env');
    process.exit(1);
  }
  app.listen(config.PORT, () => {
    console.log(`API The Wheel (Express) en http://${config.HOST}:${config.PORT}${config.API_URL}`);
    console.log(`Swagger en http://${config.HOST}:${config.PORT}/api-docs`);
  });
};

start();
