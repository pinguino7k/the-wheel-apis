// Controladores del submodulo Analisis tecnico y financiero (market_analysis)
const service = require('../services/marketAnalysis.service');
const c = require('./base.controller');

const K = 'analysisId';

module.exports = {
  getAllAnalysis: c.list(service.getAllAnalysis),
  getAnalysisById: c.getOne(service.getAnalysisById, K),
  addAnalysis: c.create(service.addAnalysis, 'Analisis creado'),
  addManyAnalysis: c.createMany(service.addManyAnalysis, 'Analisis creados'),
  updateAnalysis: c.update(service.updateAnalysis, K, 'Analisis actualizado'),
  updateManyAnalysis: c.updateMany(service.updateManyAnalysis, 'Analisis actualizados'),
  deleteAnalysis: c.remove(service.deleteAnalysis, K, 'Analisis eliminado'),
  deleteManyAnalysis: c.removeMany(service.deleteManyAnalysis, 'Analisis eliminados'),

  getInstrument: c.objGet(service.instrument, K),
  addInstrument: c.objCreate(service.instrument, K),
  updateInstrument: c.objUpdate(service.instrument, K),
  deleteInstrument: c.objRemove(service.instrument, K),

  getTechnical: c.objGet(service.technical, K),
  addTechnical: c.objCreate(service.technical, K),
  updateTechnical: c.objUpdate(service.technical, K),
  deleteTechnical: c.objRemove(service.technical, K),

  getFinancial: c.objGet(service.financial, K),
  addFinancial: c.objCreate(service.financial, K),
  updateFinancial: c.objUpdate(service.financial, K),
  deleteFinancial: c.objRemove(service.financial, K)
};
