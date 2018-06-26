const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

router.get('/', controller.test);

router.get('/webhook', controller.getWebhook);

router.post('/webhook', controller.postWebhook);

module.exports = router;