const express = require('express');
const { validateShortCode } = require('../middleware/validation');
const redirectController = require('../controllers/redirectController');

const router = express.Router();
router.get('/:shortCode', validateShortCode, redirectController.redirectToLongUrl);

module.exports = router;
