const express = require('express');
const redirectController = require('../controllers/redirectController');

const router = express.Router();
router.get('/:shortCode([A-Za-z0-9]{7})', redirectController.redirectToLongUrl);

module.exports = router;
