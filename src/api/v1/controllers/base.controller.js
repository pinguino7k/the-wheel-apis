// Funciones comunes de los controladores: leen la peticion HTTP (params, query,
// body y la sesion en req.auth), llaman al servicio y arman la respuesta JSON.
const httpError = require('../../../helpers/httpError');

const ctxOf = (req) => req.auth; // { user, rol, dbServer } del token

const send = (res, req, status, message, data, extra = {}) =>
  res.status(status).json({ success: status < 300 || status === 207, dbServer: req.auth.dbServer, message, ...extra, data });

const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

// Llaves a eliminar: body { "ids": [...] } o query ?ids=a,b,c
const idsOf = (req) => {
  if (req.body && Array.isArray(req.body.ids)) return req.body.ids;
  if (req.query.ids) return String(req.query.ids).split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};
const typeOf = (req) => (req.body && req.body.type) || req.query.type || 'logical';

// Estado para operaciones de varios registros: 200 todo bien, 207 parcial, 400 ninguno
const batchStatus = (ok, errors) => (errors.length === 0 ? 200 : ok.length === 0 ? 400 : 207);

// --------------------------- Coleccion principal ---------------------------
const list = (fn) => wrap(async (req, res) => {
  const data = await fn(ctxOf(req), req.query);
  send(res, req, 200, 'Consulta realizada', data, { count: data.length });
});

const getOne = (fn, param) => wrap(async (req, res) => {
  send(res, req, 200, 'Consulta realizada', await fn(ctxOf(req), req.params[param]));
});

const create = (fn, message) => wrap(async (req, res) => {
  send(res, req, 201, message, await fn(ctxOf(req), req.body));
});

const createMany = (fn, message) => wrap(async (req, res) => {
  if (!Array.isArray(req.body)) throw httpError(400, 'El body debe ser un arreglo de objetos');
  const data = await fn(ctxOf(req), req.body);
  send(res, req, 201, message, data, { count: data.length });
});

const update = (fn, param, message) => wrap(async (req, res) => {
  send(res, req, 200, message, await fn(ctxOf(req), req.params[param], req.body));
});

const updateMany = (fn, message) => wrap(async (req, res) => {
  const { updated, errors } = await fn(ctxOf(req), req.body);
  send(res, req, batchStatus(updated, errors), message, updated, { count: updated.length, errors });
});

const remove = (fn, param, message) => wrap(async (req, res) => {
  send(res, req, 200, message, await fn(ctxOf(req), req.params[param], typeOf(req)));
});

const removeMany = (fn, message) => wrap(async (req, res) => {
  const { deleted, errors } = await fn(ctxOf(req), idsOf(req), typeOf(req));
  send(res, req, batchStatus(deleted, errors), message, deleted, { count: deleted.length, errors });
});

// ------------------------- Subdocumentos (arreglos) -------------------------
// keyParam: parametro del documento principal; parents: parametros de niveles padre
const parentsOf = (req, parents) => parents.map((p) => req.params[p]);

const subList = (service, keyParam, parents = []) => wrap(async (req, res) => {
  const data = await service.getAll(ctxOf(req), req.params[keyParam], parentsOf(req, parents));
  send(res, req, 200, 'Consulta realizada', data, { count: data.length });
});

const subGet = (service, keyParam, parents, subParam) => wrap(async (req, res) => {
  const data = await service.getOne(ctxOf(req), req.params[keyParam], parentsOf(req, parents), req.params[subParam]);
  send(res, req, 200, 'Consulta realizada', data);
});

const subAdd = (service, keyParam, parents, many) => wrap(async (req, res) => {
  if (many && !Array.isArray(req.body)) throw httpError(400, 'El body debe ser un arreglo de objetos');
  if (!many && (Array.isArray(req.body) || !req.body || typeof req.body !== 'object')) {
    throw httpError(400, 'El body debe ser un objeto JSON');
  }
  const data = await service.add(ctxOf(req), req.params[keyParam], parentsOf(req, parents), req.body);
  send(res, req, 201, `${service.spec.label} agregado`, many ? data : data[0], many ? { count: data.length } : {});
});

const subUpdate = (service, keyParam, parents, subParam) => wrap(async (req, res) => {
  const data = await service.updateOne(ctxOf(req), req.params[keyParam], parentsOf(req, parents), req.params[subParam], req.body);
  send(res, req, 200, `${service.spec.label} actualizado`, data);
});

const subUpdateMany = (service, keyParam, parents = []) => wrap(async (req, res) => {
  const data = await service.updateMany(ctxOf(req), req.params[keyParam], parentsOf(req, parents), req.body);
  send(res, req, 200, `${service.spec.label} actualizados`, data, { count: data.length });
});

const subRemove = (service, keyParam, parents, subParam) => wrap(async (req, res) => {
  const data = await service.remove(ctxOf(req), req.params[keyParam], parentsOf(req, parents), [req.params[subParam]]);
  send(res, req, 200, `${service.spec.label} eliminado`, data[0]);
});

const subRemoveMany = (service, keyParam, parents = []) => wrap(async (req, res) => {
  const data = await service.remove(ctxOf(req), req.params[keyParam], parentsOf(req, parents), idsOf(req));
  send(res, req, 200, `${service.spec.label} eliminados`, data, { count: data.length });
});

// ------------------------- Subdocumentos (objetos) --------------------------
const objGet = (service, keyParam) => wrap(async (req, res) => {
  send(res, req, 200, 'Consulta realizada', await service.get(ctxOf(req), req.params[keyParam], []));
});

const objCreate = (service, keyParam) => wrap(async (req, res) => {
  send(res, req, 201, `${service.spec.label} agregado`, await service.create(ctxOf(req), req.params[keyParam], [], req.body));
});

const objUpdate = (service, keyParam) => wrap(async (req, res) => {
  send(res, req, 200, `${service.spec.label} actualizado`, await service.update(ctxOf(req), req.params[keyParam], [], req.body));
});

const objRemove = (service, keyParam) => wrap(async (req, res) => {
  send(res, req, 200, `${service.spec.label} eliminado`, await service.remove(ctxOf(req), req.params[keyParam], []));
});

module.exports = {
  wrap,
  list, getOne, create, createMany, update, updateMany, remove, removeMany,
  subList, subGet, subAdd, subUpdate, subUpdateMany, subRemove, subRemoveMany,
  objGet, objCreate, objUpdate, objRemove
};
