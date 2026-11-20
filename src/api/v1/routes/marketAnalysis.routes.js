// Ruteo del submodulo Analisis tecnico y financiero: /api/v1/market-analysis
const { Router } = require('express');
const c = require('../controllers/marketAnalysis.controller');

const router = Router();

// ----- Coleccion principal: market_analysis -----
router.get('/', c.getAllAnalysis);
router.post('/', c.addAnalysis);
router.post('/batch', c.addManyAnalysis);
router.put('/batch', c.updateManyAnalysis);
router.delete('/batch', c.deleteManyAnalysis);
router.get('/:analysisId', c.getAnalysisById);
router.put('/:analysisId', c.updateAnalysis);
router.delete('/:analysisId', c.deleteAnalysis);

// ----- Subdocumento objeto: instrument -----
router.get('/:analysisId/instrument', c.getInstrument);
router.post('/:analysisId/instrument', c.addInstrument);
router.put('/:analysisId/instrument', c.updateInstrument);
router.delete('/:analysisId/instrument', c.deleteInstrument);

// ----- Subdocumento objeto: technical -----
router.get('/:analysisId/technical', c.getTechnical);
router.post('/:analysisId/technical', c.addTechnical);
router.put('/:analysisId/technical', c.updateTechnical);
router.delete('/:analysisId/technical', c.deleteTechnical);

// ----- Subdocumento objeto: financial -----
router.get('/:analysisId/financial', c.getFinancial);
router.post('/:analysisId/financial', c.addFinancial);
router.put('/:analysisId/financial', c.updateFinancial);
router.delete('/:analysisId/financial', c.deleteFinancial);

module.exports = router;
