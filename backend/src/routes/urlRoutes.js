const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/authMiddleware');
const urlController = require('../controllers/urlController');
const analyticsController = require('../controllers/analyticsController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();
router.use(requireAuth);

router.get('/analytics', analyticsController.getUserAnalytics);
router.get('/:id/analytics', analyticsController.getUrlAnalytics);
router.post('/bulk', upload.single('file'), urlController.bulkCreateUrls);
router.post('/', urlController.createUrl);
router.get('/', urlController.getMyUrls);
router.delete('/:id', urlController.deleteUrl);

module.exports = router;
