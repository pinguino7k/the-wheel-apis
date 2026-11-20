// Servicios del submodulo Validaciones previas a operar (trade_validations / zt_trade_validations)
const modelDef = require('../models/tradeValidation.model');
const { createBaseService } = require('./base.service');
const { createSubdocumentService } = require('./subdocument.service');

const CHECKS = ['technical', 'financial', 'indices', 'news'];

// Regla: la operacion se aprueba solo si pasan los 4 filtros
const normalize = (doc) => {
  const checks = doc.checks || {};
  if (CHECKS.every((c) => checks[c] && typeof checks[c].passed === 'boolean')) {
    const failed = CHECKS.filter((c) => !checks[c].passed);
    doc.result = failed.length === 0 ? 'APPROVED' : 'REJECTED';
    if (!doc.reason || doc.reason.startsWith('Filtros')) {
      doc.reason = failed.length === 0 ? 'Filtros aprobados' : `Filtros no aprobados: ${failed.join(', ')}`;
    }
  }
};

const base = createBaseService({
  modelDef,
  label: 'validacion',
  filters: { symbol: 'upper', result: 'upper', wheel_id: 'text' },
  normalize
});

const checks = createSubdocumentService(base, { label: 'filtros revisados', type: 'object', required: true, path: [{ field: 'checks' }] });

module.exports = {
  getAllValidations: base.getAll,
  getValidationById: base.getOne,
  addValidation: base.addOne,
  addManyValidations: base.addMany,
  updateValidation: base.updateOne,
  updateManyValidations: base.updateMany,
  deleteValidation: base.deleteOne,
  deleteManyValidations: base.deleteMany,
  checks
};
