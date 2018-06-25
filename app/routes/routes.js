const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

router.get('/', controller.test);

router.get('/webhook', controller.getWebHook);

module.exports = router;