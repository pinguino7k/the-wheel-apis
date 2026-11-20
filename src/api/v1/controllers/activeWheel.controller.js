// Controladores del submodulo Ciclos de The Wheel (active_wheels)
const service = require('../services/activeWheel.service');
const c = require('./base.controller');

const K = 'wheelId';

module.exports = {
  // ----- Coleccion principal: active_wheels -----
  getAllWheels: c.list(service.getAllWheels),
  getWheelById: c.getOne(service.getWheelById, K),
  addWheel: c.create(service.addWheel, 'Ciclo creado'),
  addManyWheels: c.createMany(service.addManyWheels, 'Ciclos creados'),
  updateWheel: c.update(service.updateWheel, K, 'Ciclo actualizado'),
  updateManyWheels: c.updateMany(service.updateManyWheels, 'Ciclos actualizados'),
  deleteWheel: c.remove(service.deleteWheel, K, 'Ciclo eliminado'),
  deleteManyWheels: c.removeMany(service.deleteManyWheels, 'Ciclos eliminados'),

  // ----- Subdocumento arreglo: contracts -----
  getContracts: c.subList(service.contracts, K),
  getContractById: c.subGet(service.contracts, K, [], 'contractId'),
  addContract: c.subAdd(service.contracts, K, [], false),
  addManyContracts: c.subAdd(service.contracts, K, [], true),
  updateContract: c.subUpdate(service.contracts, K, [], 'contractId'),
  updateManyContracts: c.subUpdateMany(service.contracts, K),
  deleteContract: c.subRemove(service.contracts, K, [], 'contractId'),
  deleteManyContracts: c.subRemoveMany(service.contracts, K),

  // ----- Subdocumento arreglo anidado: contracts.orders -----
  getContractOrders: c.subList(service.contractOrders, K, ['contractId']),
  getContractOrderById: c.subGet(service.contractOrders, K, ['contractId'], 'orderId'),
  addContractOrder: c.subAdd(service.contractOrders, K, ['contractId'], false),
  addManyContractOrders: c.subAdd(service.contractOrders, K, ['contractId'], true),
  updateContractOrder: c.subUpdate(service.contractOrders, K, ['contractId'], 'orderId'),
  updateManyContractOrders: c.subUpdateMany(service.contractOrders, K, ['contractId']),
  deleteContractOrder: c.subRemove(service.contractOrders, K, ['contractId'], 'orderId'),
  deleteManyContractOrders: c.subRemoveMany(service.contractOrders, K, ['contractId']),

  // ----- Subdocumento arreglo: stock_orders -----
  getStockOrders: c.subList(service.stockOrders, K),
  getStockOrderById: c.subGet(service.stockOrders, K, [], 'orderId'),
  addStockOrder: c.subAdd(service.stockOrders, K, [], false),
  addManyStockOrders: c.subAdd(service.stockOrders, K, [], true),
  updateStockOrder: c.subUpdate(service.stockOrders, K, [], 'orderId'),
  updateManyStockOrders: c.subUpdateMany(service.stockOrders, K),
  deleteStockOrder: c.subRemove(service.stockOrders, K, [], 'orderId'),
  deleteManyStockOrders: c.subRemoveMany(service.stockOrders, K),

  // ----- Subdocumento arreglo: phase_history -----
  getPhaseHistory: c.subList(service.phaseHistory, K),
  getPhaseHistoryByIndex: c.subGet(service.phaseHistory, K, [], 'index'),
  addPhaseHistory: c.subAdd(service.phaseHistory, K, [], false),
  addManyPhaseHistory: c.subAdd(service.phaseHistory, K, [], true),
  updatePhaseHistory: c.subUpdate(service.phaseHistory, K, [], 'index'),
  updateManyPhaseHistory: c.subUpdateMany(service.phaseHistory, K),
  deletePhaseHistory: c.subRemove(service.phaseHistory, K, [], 'index'),
  deleteManyPhaseHistory: c.subRemoveMany(service.phaseHistory, K),

  // ----- Subdocumentos objeto: capital, position, metrics -----
  getCapital: c.objGet(service.capital, K),
  addCapital: c.objCreate(service.capital, K),
  updateCapital: c.objUpdate(service.capital, K),
  deleteCapital: c.objRemove(service.capital, K),

  getPosition: c.objGet(service.position, K),
  addPosition: c.objCreate(service.position, K),
  updatePosition: c.objUpdate(service.position, K),
  deletePosition: c.objRemove(service.position, K),

  getMetrics: c.objGet(service.metrics, K),
  addMetrics: c.objCreate(service.metrics, K),
  updateMetrics: c.objUpdate(service.metrics, K),
  deleteMetrics: c.objRemove(service.metrics, K)
};
