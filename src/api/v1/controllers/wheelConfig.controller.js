// Controladores del submodulo Configuracion de la estrategia (wheel_config)
const service = require('../services/wheelConfig.service');
const c = require('./base.controller');

const K = 'scope';

module.exports = {
  getAllConfigs: c.list(service.getAllConfigs),
  getConfigByScope: c.getOne(service.getConfigByScope, K),
  addConfig: c.create(service.addConfig, 'Configuracion creada'),
  addManyConfigs: c.createMany(service.addManyConfigs, 'Configuraciones creadas'),
  updateConfig: c.update(service.updateConfig, K, 'Configuracion actualizada'),
  updateManyConfigs: c.updateMany(service.updateManyConfigs, 'Configuraciones actualizadas'),
  deleteConfig: c.remove(service.deleteConfig, K, 'Configuracion eliminada'),
  deleteManyConfigs: c.removeMany(service.deleteManyConfigs, 'Configuraciones eliminadas'),

  getOptionRules: c.objGet(service.optionRules, K),
  addOptionRules: c.objCreate(service.optionRules, K),
  updateOptionRules: c.objUpdate(service.optionRules, K),
  deleteOptionRules: c.objRemove(service.optionRules, K),

  getFilters: c.objGet(service.filters, K),
  addFilters: c.objCreate(service.filters, K),
  updateFilters: c.objUpdate(service.filters, K),
  deleteFilters: c.objRemove(service.filters, K),

  getRisk: c.objGet(service.risk, K),
  addRisk: c.objCreate(service.risk, K),
  updateRisk: c.objUpdate(service.risk, K),
  deleteRisk: c.objRemove(service.risk, K),

  getBrokers: c.subList(service.brokers, K),
  getBrokerByName: c.subGet(service.brokers, K, [], 'name'),
  addBroker: c.subAdd(service.brokers, K, [], false),
  addManyBrokers: c.subAdd(service.brokers, K, [], true),
  updateBroker: c.subUpdate(service.brokers, K, [], 'name'),
  updateManyBrokers: c.subUpdateMany(service.brokers, K),
  deleteBroker: c.subRemove(service.brokers, K, [], 'name'),
  deleteManyBrokers: c.subRemoveMany(service.brokers, K)
};
