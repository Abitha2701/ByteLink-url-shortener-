const express = require('express');
const redirectController = require('../controllers/redirectController');

const router = express.Router();
router.get('/:shortCode([A-Za-z0-9_-]{4,30})', redirectController.redirectToLongUrl);

module.exports = router;
