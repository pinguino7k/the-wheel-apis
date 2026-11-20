// Servicio de subdocumentos: GET, POST, PUT y DELETE de un subdocumento
// objeto o de un arreglo de subdocumentos (uno o varios elementos).
const sub = require('../../../helpers/subdocumentos');
const httpError = require('../../../helpers/httpError');

// spec: { label, type: 'array' | 'object', path: [...], required, autoKey }
const createSubdocumentService = (baseService, spec) => {
  if (spec.type === 'object') {
    return {
      spec,
      // GET del subdocumento objeto
      get: async (ctx, key, parentKeys = []) => sub.getObject(await baseService.getOne(ctx, key), spec, parentKeys),

      // POST: crea el subdocumento si no existe
      create: async (ctx, key, parentKeys, data) => {
        const doc = await baseService.getActive(ctx, key);
        sub.createObject(doc, spec, parentKeys, data);
        const saved = await baseService.saveDocument(ctx, key, doc);
        return sub.getObject(saved, spec, parentKeys);
      },

      // PUT: modifica solo los campos enviados
      update: async (ctx, key, parentKeys, changes) => {
        const doc = await baseService.getActive(ctx, key);
        sub.updateObject(doc, spec, parentKeys, changes);
        const saved = await baseService.saveDocument(ctx, key, doc);
        return sub.getObject(saved, spec, parentKeys);
      },

      // DELETE: quita el subdocumento (si no es obligatorio)
      remove: async (ctx, key, parentKeys) => {
        const doc = await baseService.getActive(ctx, key);
        const removed = sub.removeObject(doc, spec, parentKeys);
        await baseService.saveDocument(ctx, key, doc);
        return removed;
      }
    };
  }

  const keyOf = (item) => {
    const level = spec.path[spec.path.length - 1];
    return level.key ? item[level.key] : undefined;
  };

  return {
    spec,
    // GET de todos los elementos del arreglo
    getAll: async (ctx, key, parentKeys = []) => sub.listItems(await baseService.getOne(ctx, key), spec, parentKeys),

    // GET de un elemento
    getOne: async (ctx, key, parentKeys, subKey) =>
      sub.getItem(await baseService.getOne(ctx, key), spec, parentKeys, subKey),

    // POST de uno (objeto) o varios (arreglo de objetos)
    add: async (ctx, key, parentKeys, items) => {
      const list = Array.isArray(items) ? items : [items];
      if (list.length === 0) throw httpError(400, `Envie al menos un ${spec.label}`);
      const doc = await baseService.getActive(ctx, key);
      const added = sub.addItems(doc, spec, parentKeys, list);
      const saved = await baseService.saveDocument(ctx, key, doc);
      const level = spec.path[spec.path.length - 1];
      if (!level.key) return sub.listItems(saved, spec, parentKeys).slice(-added.length);
      return added.map((item) => sub.getItem(saved, spec, parentKeys, keyOf(item)));
    },

    // PUT de un elemento
    updateOne: async (ctx, key, parentKeys, subKey, changes) => {
      const doc = await baseService.getActive(ctx, key);
      sub.updateItem(doc, spec, parentKeys, subKey, changes);
      const saved = await baseService.saveDocument(ctx, key, doc);
      return sub.getItem(saved, spec, parentKeys, subKey);
    },

    // PUT de varios elementos: cada objeto trae su llave (o "index" en el historial)
    updateMany: async (ctx, key, parentKeys, items) => {
      if (!Array.isArray(items) || items.length === 0) {
        throw httpError(400, `El body debe ser un arreglo de ${spec.label}`);
      }
      const level = spec.path[spec.path.length - 1];
      const keyName = level.key || 'index';
      const doc = await baseService.getActive(ctx, key);
      const keys = items.map((item) => {
        const k = item ? item[keyName] : undefined;
        if (k === undefined || k === null) throw httpError(400, `Cada elemento debe traer ${keyName}`);
        const { index, ...changes } = item;
        sub.updateItem(doc, spec, parentKeys, k, level.key ? item : changes);
        return k;
      });
      const saved = await baseService.saveDocument(ctx, key, doc);
      return keys.map((k) => sub.getItem(saved, spec, parentKeys, k));
    },

    // DELETE de uno o varios elementos
    remove: async (ctx, key, parentKeys, subKeys) => {
      if (!Array.isArray(subKeys) || subKeys.length === 0) {
        throw httpError(400, 'Envie un arreglo "ids" con los elementos a eliminar');
      }
      const doc = await baseService.getActive(ctx, key);
      const removed = sub.removeItems(doc, spec, parentKeys, subKeys);
      await baseService.saveDocument(ctx, key, doc);
      return removed;
    }
  };
};

module.exports = { createSubdocumentService };
