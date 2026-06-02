const express = require('express');
const { validateShortCode } = require('../middleware/validation');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();
router.get('/stats/:shortCode', validateShortCode, analyticsController.getPublicUrlStats);

module.exports = router;
