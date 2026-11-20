// Controladores del submodulo Validaciones previas a operar (trade_validations)
const service = require('../services/tradeValidation.service');
const c = require('./base.controller');

const K = 'validationId';

module.exports = {
  getAllValidations: c.list(service.getAllValidations),
  getValidationById: c.getOne(service.getValidationById, K),
  addValidation: c.create(service.addValidation, 'Validacion creada'),
  addManyValidations: c.createMany(service.addManyValidations, 'Validaciones creadas'),
  updateValidation: c.update(service.updateValidation, K, 'Validacion actualizada'),
  updateManyValidations: c.updateMany(service.updateManyValidations, 'Validaciones actualizadas'),
  deleteValidation: c.remove(service.deleteValidation, K, 'Validacion eliminada'),
  deleteManyValidations: c.removeMany(service.deleteManyValidations, 'Validaciones eliminadas'),

  getChecks: c.objGet(service.checks, K),
  addChecks: c.objCreate(service.checks, K),
  updateChecks: c.objUpdate(service.checks, K),
  deleteChecks: c.objRemove(service.checks, K)
};
