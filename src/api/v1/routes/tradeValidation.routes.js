// Ruteo del submodulo Validaciones previas a operar: /api/v1/trade-validations
const { Router } = require('express');
const c = require('../controllers/tradeValidation.controller');

const router = Router();

// ----- Coleccion principal: trade_validations -----
router.get('/', c.getAllValidations);
router.post('/', c.addValidation);
router.post('/batch', c.addManyValidations);
router.put('/batch', c.updateManyValidations);
router.delete('/batch', c.deleteManyValidations);
router.get('/:validationId', c.getValidationById);
router.put('/:validationId', c.updateValidation);
router.delete('/:validationId', c.deleteValidation);

// ----- Subdocumento objeto: checks -----
router.get('/:validationId/checks', c.getChecks);
router.post('/:validationId/checks', c.addChecks);
router.put('/:validationId/checks', c.updateChecks);
router.delete('/:validationId/checks', c.deleteChecks);

module.exports = router;
