// Servicios del submodulo Configuracion de la estrategia (wheel_config / zt_wheel_config)
const modelDef = require('../models/wheelConfig.model');
const httpError = require('../../../helpers/httpError');
const { createBaseService } = require('./base.service');
const { createSubdocumentService } = require('./subdocument.service');

// Regla: el rango de dias al vencimiento debe ser valido
const normalize = (doc) => {
  if (doc.scope) doc.scope = String(doc.scope).toUpperCase();
  const r = doc.option_rules;
  if (r && r.dte_min !== undefined && r.dte_max !== undefined && Number(r.dte_min) > Number(r.dte_max)) {
    throw httpError(400, 'dte_min no puede ser mayor que dte_max');
  }
};

const base = createBaseService({
  modelDef,
  label: 'configuracion',
  filters: { scope: 'upper' },
  normalize
});

const optionRules = createSubdocumentService(base, { label: 'reglas de opciones', type: 'object', required: true, path: [{ field: 'option_rules' }] });
const filters = createSubdocumentService(base, { label: 'filtros', type: 'object', required: true, path: [{ field: 'filters' }] });
const risk = createSubdocumentService(base, { label: 'riesgo', type: 'object', path: [{ field: 'risk' }] });
const brokers = createSubdocumentService(base, {
  label: 'broker',
  type: 'array',
  path: [{ field: 'brokers', key: 'name' }]
});

// La llave de la configuracion (scope) se recibe en mayusculas
const upper = (fn) => (ctx, key, ...rest) => fn(ctx, String(key).toUpperCase(), ...rest);

module.exports = {
  getAllConfigs: base.getAll,
  getConfigByScope: upper(base.getOne),
  addConfig: base.addOne,
  addManyConfigs: base.addMany,
  updateConfig: upper(base.updateOne),
  updateManyConfigs: (ctx, items) => base.updateMany(ctx, (items || []).map((i) => (i && i.scope ? { ...i, scope: String(i.scope).toUpperCase() } : i))),
  deleteConfig: upper(base.deleteOne),
  deleteManyConfigs: (ctx, keys, type) => base.deleteMany(ctx, (keys || []).map((k) => String(k).toUpperCase()), type),
  optionRules,
  filters,
  risk,
  brokers
};
