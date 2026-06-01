const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const urlController = require('../controllers/urlController');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();
router.use(requireAuth);

router.get('/analytics', analyticsController.getUserAnalytics);
router.get('/:id/analytics', analyticsController.getUrlAnalytics);
router.post('/', urlController.createUrl);
router.get('/', urlController.getMyUrls);
router.delete('/:id', urlController.deleteUrl);

module.exports = router;
