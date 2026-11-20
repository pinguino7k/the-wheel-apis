// Servicios del submodulo Analisis tecnico y financiero (market_analysis / zt_market_analysis)
const modelDef = require('../models/marketAnalysis.model');
const { createBaseService } = require('./base.service');
const { createSubdocumentService } = require('./subdocument.service');

const base = createBaseService({
  modelDef,
  label: 'analisis',
  filters: { symbol: 'upper' }
});

const instrument = createSubdocumentService(base, { label: 'instrumento', type: 'object', path: [{ field: 'instrument' }] });
const technical = createSubdocumentService(base, { label: 'analisis tecnico', type: 'object', required: true, path: [{ field: 'technical' }] });
const financial = createSubdocumentService(base, { label: 'analisis financiero', type: 'object', required: true, path: [{ field: 'financial' }] });

module.exports = {
  getAllAnalysis: base.getAll,
  getAnalysisById: base.getOne,
  addAnalysis: base.addOne,
  addManyAnalysis: base.addMany,
  updateAnalysis: base.updateOne,
  updateManyAnalysis: base.updateMany,
  deleteAnalysis: base.deleteOne,
  deleteManyAnalysis: base.deleteMany,
  instrument,
  technical,
  financial
};
