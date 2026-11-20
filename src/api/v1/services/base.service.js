// Servicio base: GET, POST, PUT y DELETE de una coleccion principal (uno o varios).
// Cada servicio del submodulo lo crea con su modelo y sus reglas de negocio.
const httpError = require('../../../helpers/httpError');
const { newDetailRow, pushRegistry } = require('../../../helpers/auditoria');
const { getRepository } = require('../repositories');

// Campos que nunca se modifican desde un PUT
const PROTECTED = ['_id', 'DETAIL_ROW'];

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

const createBaseService = ({
  modelDef,           // { Model, table, keyField } del archivo de modelo
  label,              // nombre para los mensajes, ej. "ciclo"
  filters = {},       // filtros permitidos en GET: { campo: 'upper' | 'boolean' | 'text' }
  onCreate,           // async (doc, repo, ctx) => prepara un documento nuevo
  onUpdate,           // (current, changes, ctx) => reglas al modificar
  onLogicalDelete,    // (doc) => cambios extra en el borrado logico
  normalize           // (doc) => calculos antes de guardar (totales, resultados)
}) => {
  const { keyField } = modelDef;
  const repo = (ctx) => getRepository(ctx.dbServer, modelDef);

  const parseFilters = (query = {}) => {
    const result = {};
    Object.entries(filters).forEach(([field, type]) => {
      const value = query[field];
      if (value === undefined || value === '') return;
      if (type === 'upper') result[field] = String(value).toUpperCase();
      else if (type === 'boolean') result[field] = String(value) === 'true';
      else result[field] = value;
    });
    return result;
  };

  // ------------------------------ GET ------------------------------
  const getAll = async (ctx, query = {}) =>
    repo(ctx).find(parseFilters(query), String(query.includeDeleted) === 'true');

  const getOne = async (ctx, key) => {
    const doc = await repo(ctx).findOne(key);
    if (!doc) throw httpError(404, `No existe el ${label} ${key}`);
    return doc;
  };

  // ------------------------------ POST -----------------------------
  const addMany = async (ctx, items) => {
    if (!Array.isArray(items) || items.length === 0) {
      throw httpError(400, `El body debe ser un arreglo con al menos un ${label}`);
    }
    const r = repo(ctx);
    const docs = [];
    for (const item of items) {
      if (!isObject(item)) throw httpError(400, `Cada ${label} debe ser un objeto JSON`);
      const { DETAIL_ROW, ...data } = item;
      const doc = { ...data, DETAIL_ROW: newDetailRow(ctx.user) };
      if (onCreate) await onCreate(doc, r, ctx, docs);
      if (normalize) normalize(doc);
      if (keyField !== '_id') {
        if (!doc[keyField]) throw httpError(400, `El campo ${keyField} es obligatorio`);
        if (docs.some((d) => String(d[keyField]) === String(doc[keyField]))) {
          throw httpError(409, `El ${label} ${doc[keyField]} esta repetido en el arreglo`);
        }
        if (await r.findOne(doc[keyField])) throw httpError(409, `El ${label} ${doc[keyField]} ya existe`);
      }
      docs.push(doc);
    }
    return r.insertMany(docs);
  };

  const addOne = async (ctx, data) => {
    if (!isObject(data)) throw httpError(400, 'El body debe ser un objeto JSON');
    const [saved] = await addMany(ctx, [data]);
    return saved;
  };

  // ------------------------------ PUT ------------------------------
  const updateOne = async (ctx, key, data) => {
    if (!isObject(data)) throw httpError(400, 'El body debe ser un objeto JSON');
    const current = await getOne(ctx, key);
    if (current.DETAIL_ROW && current.DETAIL_ROW.DELETED) {
      throw httpError(400, `El ${label} ${key} esta eliminado`);
    }
    const changes = { ...data };
    [...PROTECTED, keyField].forEach((f) => delete changes[f]);
    if (onUpdate) onUpdate(current, changes, ctx);
    const doc = { ...current, ...changes };
    if (normalize) normalize(doc);
    pushRegistry(doc, ctx.user);
    return repo(ctx).replaceOne(key, doc);
  };

  // Cada elemento del arreglo debe traer su llave; se informa el resultado de cada uno
  const updateMany = async (ctx, items) => {
    if (!Array.isArray(items) || items.length === 0) {
      throw httpError(400, `El body debe ser un arreglo de objetos con su ${keyField}`);
    }
    const updated = [];
    const errors = [];
    for (const item of items) {
      const key = item && item[keyField];
      try {
        if (!key) throw httpError(400, `Falta ${keyField}`);
        updated.push(await updateOne(ctx, key, item));
      } catch (error) {
        errors.push({ [keyField]: key || null, status: error.status || 400, message: error.message });
      }
    }
    return { updated, errors };
  };

  // ----------------------------- DELETE ----------------------------
  // type=logical (por defecto) marca DELETED=true; type=physical borra el registro
  const deleteOne = async (ctx, key, type = 'logical') => {
    const current = await getOne(ctx, key);
    if (type === 'physical') {
      await repo(ctx).deleteMany([key]);
      return { [keyField]: key, deleted: 'physical' };
    }
    const doc = { ...current, DETAIL_ROW: { ...current.DETAIL_ROW, ACTIVED: false, DELETED: true } };
    if (onLogicalDelete) onLogicalDelete(doc);
    pushRegistry(doc, ctx.user);
    return repo(ctx).replaceOne(key, doc);
  };

  const deleteMany = async (ctx, keys, type = 'logical') => {
    if (!Array.isArray(keys) || keys.length === 0) {
      throw httpError(400, 'Envie un arreglo "ids" con las llaves a eliminar');
    }
    const deleted = [];
    const errors = [];
    for (const key of keys) {
      try {
        deleted.push(await deleteOne(ctx, key, type));
      } catch (error) {
        errors.push({ [keyField]: key, status: error.status || 400, message: error.message });
      }
    }
    return { deleted, errors };
  };

  // Usado por los servicios de subdocumentos: guarda el documento completo
  const saveDocument = async (ctx, key, doc) => {
    if (normalize) normalize(doc);
    pushRegistry(doc, ctx.user);
    return repo(ctx).replaceOne(key, doc);
  };

  const getActive = async (ctx, key) => {
    const doc = await getOne(ctx, key);
    if (doc.DETAIL_ROW && doc.DETAIL_ROW.DELETED) throw httpError(400, `El ${label} ${key} esta eliminado`);
    return doc;
  };

  return {
    keyField,
    label,
    getAll,
    getOne,
    addOne,
    addMany,
    updateOne,
    updateMany,
    deleteOne,
    deleteMany,
    saveDocument,
    getActive
  };
};

module.exports = { createBaseService };
