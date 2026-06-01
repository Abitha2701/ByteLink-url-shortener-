const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const urlController = require('../controllers/urlController');

const router = express.Router();
router.use(requireAuth);

router.post('/', urlController.createUrl);
router.get('/', urlController.getMyUrls);
router.delete('/:id', urlController.deleteUrl);

module.exports = router;
