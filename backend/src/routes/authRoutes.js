const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validation');

router.post('/signup', authLimiter, validateRegister, authController.signup);
router.post('/login', authLimiter, validateLogin, authController.login);
router.get('/me', requireAuth, authController.getProfile);

module.exports = router;
