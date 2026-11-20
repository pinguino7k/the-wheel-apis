// Conexion a la base de datos NoSQL: MongoDB (local o Atlas) con Mongoose
const dns = require('dns');
const mongoose = require('mongoose');
const config = require('./config');

const connectMongo = async () => {
  try {
    // La cadena mongodb+srv de Atlas necesita una consulta DNS de tipo SRV;
    // en algunas redes de Windows el DNS local la rechaza, por eso se usan
    // servidores DNS publicos para resolverla.
    if (config.CONNECTION_STRING.startsWith('mongodb+srv://')) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    }
    const conn = await mongoose.connect(config.CONNECTION_STRING, {
      dbName: config.DATABASE,
      autoIndex: false // los indices ya existen en la BD; no se crean desde la API
    });
    console.log(`MongoDB conectado: ${conn.connection.host} / BD: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    return false;
  }
};

const isMongoReady = () => mongoose.connection.readyState === 1;

module.exports = { connectMongo, isMongoReady };
