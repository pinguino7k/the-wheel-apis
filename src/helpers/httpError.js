// Error con codigo HTTP para que el manejador de errores responda correctamente
const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = httpError;
