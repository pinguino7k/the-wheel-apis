// Ruteo del submodulo Indices de mercado: /api/v1/market-indices
const { Router } = require('express');
const c = require('../controllers/marketIndex.controller');

const router = Router();

// ----- Coleccion principal: market_indices -----
router.get('/', c.getAllIndices);
router.post('/', c.addIndices);
router.post('/batch', c.addManyIndices);
router.put('/batch', c.updateManyIndices);
router.delete('/batch', c.deleteManyIndices);
router.get('/:indexId', c.getIndicesById);
router.put('/:indexId', c.updateIndices);
router.delete('/:indexId', c.deleteIndices);

// ----- Subdocumento arreglo: indices -----
router.get('/:indexId/indices', c.getIndexItems);
router.post('/:indexId/indices', c.addIndexItem);
router.post('/:indexId/indices/batch', c.addManyIndexItems);
router.put('/:indexId/indices/batch', c.updateManyIndexItems);
router.delete('/:indexId/indices/batch', c.deleteManyIndexItems);
router.get('/:indexId/indices/:symbol', c.getIndexItemBySymbol);
router.put('/:indexId/indices/:symbol', c.updateIndexItem);
router.delete('/:indexId/indices/:symbol', c.deleteIndexItem);

module.exports = router;
