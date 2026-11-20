// Operaciones sobre subdocumentos de un documento (objetos y arreglos de objetos).
// Funcionan sobre el objeto JSON ya leido de la BD, por eso sirven igual para
// MongoDB y para Supabase (donde los subdocumentos se guardan en columnas jsonb).
//
// Un subdocumento se describe con "path": la lista de niveles desde la raiz.
//   contracts         -> [{ field: 'contracts', key: 'contract_id' }]
//   contracts.orders  -> [{ field: 'contracts', key: 'contract_id' },
//                         { field: 'orders', key: 'broker_order_id' }]
//   phase_history     -> [{ field: 'phase_history', key: null }]  (se usa la posicion)
//   technical (objeto)-> [{ field: 'technical' }]
const httpError = require('./httpError');

const sameKey = (a, b) => a !== undefined && a !== null && String(a) === String(b);

// Busca un elemento de un arreglo por su llave (o por su posicion si key es null)
const findIndex = (list, level, value) => {
  if (level.key) return list.findIndex((item) => item && sameKey(item[level.key], value));
  const pos = Number(value);
  return Number.isInteger(pos) && pos >= 0 && pos < list.length ? pos : -1;
};

// Recorre los niveles padre y regresa el objeto que contiene al subdocumento final
const resolveParent = (doc, spec, parentKeys = []) => {
  let current = doc;
  spec.path.slice(0, -1).forEach((level, i) => {
    const list = current[level.field] || [];
    const idx = findIndex(list, level, parentKeys[i]);
    if (idx < 0) throw httpError(404, `No existe ${level.label || level.field} ${parentKeys[i]}`);
    current = list[idx];
  });
  return current;
};

const lastLevel = (spec) => spec.path[spec.path.length - 1];

// ----------------------------- Arreglos -----------------------------

const listItems = (doc, spec, parentKeys) => {
  const parent = resolveParent(doc, spec, parentKeys);
  return parent[lastLevel(spec).field] || [];
};

const getItem = (doc, spec, parentKeys, key) => {
  const level = lastLevel(spec);
  const list = listItems(doc, spec, parentKeys);
  const idx = findIndex(list, level, key);
  if (idx < 0) throw httpError(404, `No existe ${spec.label} ${key}`);
  return list[idx];
};

// Agrega uno o varios elementos; valida que la llave no se repita
const addItems = (doc, spec, parentKeys, items) => {
  const level = lastLevel(spec);
  const parent = resolveParent(doc, spec, parentKeys);
  if (!Array.isArray(parent[level.field])) parent[level.field] = [];
  const list = parent[level.field];
  items.forEach((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw httpError(400, `Cada ${spec.label} debe ser un objeto JSON`);
    }
    if (level.key) {
      if (item[level.key] === undefined || item[level.key] === null || item[level.key] === '') {
        if (spec.autoKey) item[level.key] = spec.autoKey(list, doc);
        else throw httpError(400, `El campo ${level.key} es obligatorio en ${spec.label}`);
      }
      if (findIndex(list, level, item[level.key]) >= 0) {
        throw httpError(409, `Ya existe ${spec.label} ${item[level.key]}`);
      }
    }
    list.push(item);
  });
  return items;
};

// Modifica un elemento (solo los campos enviados); la llave no se puede cambiar
const updateItem = (doc, spec, parentKeys, key, changes) => {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    throw httpError(400, 'El body debe ser un objeto JSON');
  }
  const level = lastLevel(spec);
  const list = listItems(doc, spec, parentKeys);
  const idx = findIndex(list, level, key);
  if (idx < 0) throw httpError(404, `No existe ${spec.label} ${key}`);
  const { [level.key || '_none_']: ignored, ...rest } = changes;
  list[idx] = { ...list[idx], ...rest };
  return list[idx];
};

// Elimina uno o varios elementos por su llave (o posicion)
const removeItems = (doc, spec, parentKeys, keys) => {
  const level = lastLevel(spec);
  const parent = resolveParent(doc, spec, parentKeys);
  const list = parent[level.field] || [];
  const positions = keys.map((key) => {
    const idx = findIndex(list, level, key);
    if (idx < 0) throw httpError(404, `No existe ${spec.label} ${key}`);
    return idx;
  });
  const removed = positions.map((idx) => list[idx]);
  // se borra de atras hacia adelante para no mover las posiciones pendientes
  [...new Set(positions)].sort((a, b) => b - a).forEach((idx) => list.splice(idx, 1));
  parent[level.field] = list;
  return removed;
};

// ----------------------------- Objetos ------------------------------

const getObject = (doc, spec, parentKeys) => {
  const parent = resolveParent(doc, spec, parentKeys);
  const value = parent[lastLevel(spec).field];
  if (value === undefined || value === null) throw httpError(404, `El documento no tiene ${spec.label}`);
  return value;
};

const createObject = (doc, spec, parentKeys, data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw httpError(400, 'El body debe ser un objeto JSON');
  }
  const parent = resolveParent(doc, spec, parentKeys);
  const field = lastLevel(spec).field;
  const value = parent[field];
  if (value !== undefined && value !== null && Object.keys(value).length > 0) { // existe y no esta vacio
    throw httpError(409, `El documento ya tiene ${spec.label}; use PUT para modificarlo`);
  }
  parent[field] = data;
  return data;
};

const updateObject = (doc, spec, parentKeys, changes) => {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    throw httpError(400, 'El body debe ser un objeto JSON');
  }
  const parent = resolveParent(doc, spec, parentKeys);
  const field = lastLevel(spec).field;
  if (parent[field] === undefined || parent[field] === null) {
    throw httpError(404, `El documento no tiene ${spec.label}; use POST para crearlo`);
  }
  parent[field] = { ...parent[field], ...changes };
  return parent[field];
};

const removeObject = (doc, spec, parentKeys) => {
  if (spec.required) {
    throw httpError(400, `${spec.label} es obligatorio y no se puede eliminar; use PUT para modificarlo`);
  }
  const parent = resolveParent(doc, spec, parentKeys);
  const field = lastLevel(spec).field;
  const value = parent[field];
  if (value === undefined || value === null) throw httpError(404, `El documento no tiene ${spec.label}`);
  delete parent[field]; // se quita el campo del documento ($unset)
  return value;
};

module.exports = {
  listItems,
  getItem,
  addItems,
  updateItem,
  removeItems,
  getObject,
  createObject,
  updateObject,
  removeObject
};
