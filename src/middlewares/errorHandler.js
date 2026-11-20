// Manejo centralizado de errores del microservicio
const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  if (err.name === 'ValidationError' || err.name === 'CastError') status = 400;
  if (err.type === 'entity.parse.failed') status = 400; // JSON mal formado
  if (err.code === 121) status = 400; // validacion $jsonSchema de MongoDB
  if (err.code === 11000 || err.code === '23505') status = 409; // llave duplicada (Mongo / PostgreSQL)
  res.status(status).json({ success: false, message: err.message });
};

module.exports = { notFound, errorHandler };
