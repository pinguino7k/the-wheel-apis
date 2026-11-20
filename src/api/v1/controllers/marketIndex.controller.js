// Controladores del submodulo Indices de mercado (market_indices)
const service = require('../services/marketIndex.service');
const c = require('./base.controller');

const K = 'indexId';

module.exports = {
  getAllIndices: c.list(service.getAllIndices),
  getIndicesById: c.getOne(service.getIndicesById, K),
  addIndices: c.create(service.addIndices, 'Registro de indices creado'),
  addManyIndices: c.createMany(service.addManyIndices, 'Registros de indices creados'),
  updateIndices: c.update(service.updateIndices, K, 'Registro de indices actualizado'),
  updateManyIndices: c.updateMany(service.updateManyIndices, 'Registros de indices actualizados'),
  deleteIndices: c.remove(service.deleteIndices, K, 'Registro de indices eliminado'),
  deleteManyIndices: c.removeMany(service.deleteManyIndices, 'Registros de indices eliminados'),

  getIndexItems: c.subList(service.indices, K),
  getIndexItemBySymbol: c.subGet(service.indices, K, [], 'symbol'),
  addIndexItem: c.subAdd(service.indices, K, [], false),
  addManyIndexItems: c.subAdd(service.indices, K, [], true),
  updateIndexItem: c.subUpdate(service.indices, K, [], 'symbol'),
  updateManyIndexItems: c.subUpdateMany(service.indices, K),
  deleteIndexItem: c.subRemove(service.indices, K, [], 'symbol'),
  deleteManyIndexItems: c.subRemoveMany(service.indices, K)
};
