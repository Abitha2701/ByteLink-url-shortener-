const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();
router.get('/stats/:shortCode([A-Za-z0-9_-]{4,30})', analyticsController.getPublicUrlStats);

module.exports = router;
