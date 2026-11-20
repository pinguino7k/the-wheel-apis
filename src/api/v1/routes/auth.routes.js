// Ruteo de inicio de sesion: /api/v1/auth
const { Router } = require('express');
const c = require('../controllers/auth.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

const router = Router();

router.post('/login', c.login);
router.get('/me', authenticate, c.me);

module.exports = router;
