// Servicios del submodulo Indices de mercado (market_indices / zt_market_indices)
const modelDef = require('../models/marketIndex.model');
const { createBaseService } = require('./base.service');
const { createSubdocumentService } = require('./subdocument.service');

// Regla de riesgo: el nivel depende del VIX y con riesgo alto no se abren contratos
const normalize = (doc) => {
  const vix = (doc.indices || []).find((i) => i.symbol === 'VIX');
  if (vix && typeof vix.close === 'number') {
    doc.risk_level = vix.close >= 30 ? 'HIGH' : vix.close >= 20 ? 'MEDIUM' : 'LOW';
  }
  if (doc.risk_level) doc.trading_allowed = doc.risk_level !== 'HIGH';
};

const base = createBaseService({
  modelDef,
  label: 'registro de indices',
  filters: { risk_level: 'upper' },
  normalize
});

const indices = createSubdocumentService(base, {
  label: 'indice',
  type: 'array',
  path: [{ field: 'indices', key: 'symbol' }]
});

module.exports = {
  getAllIndices: base.getAll,
  getIndicesById: base.getOne,
  addIndices: base.addOne,
  addManyIndices: base.addMany,
  updateIndices: base.updateOne,
  updateManyIndices: base.updateMany,
  deleteIndices: base.deleteOne,
  deleteManyIndices: base.deleteMany,
  indices
};
