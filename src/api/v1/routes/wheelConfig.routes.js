// Ruteo del submodulo Configuracion de la estrategia: /api/v1/wheel-config
const { Router } = require('express');
const c = require('../controllers/wheelConfig.controller');

const router = Router();

// ----- Coleccion principal: wheel_config -----
router.get('/', c.getAllConfigs);
router.post('/', c.addConfig);
router.post('/batch', c.addManyConfigs);
router.put('/batch', c.updateManyConfigs);
router.delete('/batch', c.deleteManyConfigs);
router.get('/:scope', c.getConfigByScope);
router.put('/:scope', c.updateConfig);
router.delete('/:scope', c.deleteConfig);

// ----- Subdocumento objeto: option_rules -----
router.get('/:scope/option-rules', c.getOptionRules);
router.post('/:scope/option-rules', c.addOptionRules);
router.put('/:scope/option-rules', c.updateOptionRules);
router.delete('/:scope/option-rules', c.deleteOptionRules);

// ----- Subdocumento objeto: filters -----
router.get('/:scope/filters', c.getFilters);
router.post('/:scope/filters', c.addFilters);
router.put('/:scope/filters', c.updateFilters);
router.delete('/:scope/filters', c.deleteFilters);

// ----- Subdocumento objeto: risk -----
router.get('/:scope/risk', c.getRisk);
router.post('/:scope/risk', c.addRisk);
router.put('/:scope/risk', c.updateRisk);
router.delete('/:scope/risk', c.deleteRisk);

// ----- Subdocumento arreglo: brokers -----
router.get('/:scope/brokers', c.getBrokers);
router.post('/:scope/brokers', c.addBroker);
router.post('/:scope/brokers/batch', c.addManyBrokers);
router.put('/:scope/brokers/batch', c.updateManyBrokers);
router.delete('/:scope/brokers/batch', c.deleteManyBrokers);
router.get('/:scope/brokers/:name', c.getBrokerByName);
router.put('/:scope/brokers/:name', c.updateBroker);
router.delete('/:scope/brokers/:name', c.deleteBroker);

module.exports = router;
