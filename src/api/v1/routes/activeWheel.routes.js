// Ruteo del submodulo Ciclos de The Wheel: /api/v1/active-wheels
// Las rutas /batch (varios registros) van antes que las rutas con parametro.
const { Router } = require('express');
const c = require('../controllers/activeWheel.controller');

const router = Router();

// ----- Coleccion principal: active_wheels -----
router.get('/', c.getAllWheels);
router.post('/', c.addWheel);
router.post('/batch', c.addManyWheels);
router.put('/batch', c.updateManyWheels);
router.delete('/batch', c.deleteManyWheels);
router.get('/:wheelId', c.getWheelById);
router.put('/:wheelId', c.updateWheel);
router.delete('/:wheelId', c.deleteWheel);

// ----- Subdocumento arreglo: contracts -----
router.get('/:wheelId/contracts', c.getContracts);
router.post('/:wheelId/contracts', c.addContract);
router.post('/:wheelId/contracts/batch', c.addManyContracts);
router.put('/:wheelId/contracts/batch', c.updateManyContracts);
router.delete('/:wheelId/contracts/batch', c.deleteManyContracts);
router.get('/:wheelId/contracts/:contractId', c.getContractById);
router.put('/:wheelId/contracts/:contractId', c.updateContract);
router.delete('/:wheelId/contracts/:contractId', c.deleteContract);

// ----- Subdocumento arreglo anidado: contracts[].orders -----
router.get('/:wheelId/contracts/:contractId/orders', c.getContractOrders);
router.post('/:wheelId/contracts/:contractId/orders', c.addContractOrder);
router.post('/:wheelId/contracts/:contractId/orders/batch', c.addManyContractOrders);
router.put('/:wheelId/contracts/:contractId/orders/batch', c.updateManyContractOrders);
router.delete('/:wheelId/contracts/:contractId/orders/batch', c.deleteManyContractOrders);
router.get('/:wheelId/contracts/:contractId/orders/:orderId', c.getContractOrderById);
router.put('/:wheelId/contracts/:contractId/orders/:orderId', c.updateContractOrder);
router.delete('/:wheelId/contracts/:contractId/orders/:orderId', c.deleteContractOrder);

// ----- Subdocumento arreglo: stock_orders -----
router.get('/:wheelId/stock-orders', c.getStockOrders);
router.post('/:wheelId/stock-orders', c.addStockOrder);
router.post('/:wheelId/stock-orders/batch', c.addManyStockOrders);
router.put('/:wheelId/stock-orders/batch', c.updateManyStockOrders);
router.delete('/:wheelId/stock-orders/batch', c.deleteManyStockOrders);
router.get('/:wheelId/stock-orders/:orderId', c.getStockOrderById);
router.put('/:wheelId/stock-orders/:orderId', c.updateStockOrder);
router.delete('/:wheelId/stock-orders/:orderId', c.deleteStockOrder);

// ----- Subdocumento arreglo: phase_history (se identifica por posicion) -----
router.get('/:wheelId/phase-history', c.getPhaseHistory);
router.post('/:wheelId/phase-history', c.addPhaseHistory);
router.post('/:wheelId/phase-history/batch', c.addManyPhaseHistory);
router.put('/:wheelId/phase-history/batch', c.updateManyPhaseHistory);
router.delete('/:wheelId/phase-history/batch', c.deleteManyPhaseHistory);
router.get('/:wheelId/phase-history/:index', c.getPhaseHistoryByIndex);
router.put('/:wheelId/phase-history/:index', c.updatePhaseHistory);
router.delete('/:wheelId/phase-history/:index', c.deletePhaseHistory);

// ----- Subdocumento objeto: capital -----
router.get('/:wheelId/capital', c.getCapital);
router.post('/:wheelId/capital', c.addCapital);
router.put('/:wheelId/capital', c.updateCapital);
router.delete('/:wheelId/capital', c.deleteCapital);

// ----- Subdocumento objeto: position -----
router.get('/:wheelId/position', c.getPosition);
router.post('/:wheelId/position', c.addPosition);
router.put('/:wheelId/position', c.updatePosition);
router.delete('/:wheelId/position', c.deletePosition);

// ----- Subdocumento objeto: metrics -----
router.get('/:wheelId/metrics', c.getMetrics);
router.post('/:wheelId/metrics', c.addMetrics);
router.put('/:wheelId/metrics', c.updateMetrics);
router.delete('/:wheelId/metrics', c.deleteMetrics);

module.exports = router;
