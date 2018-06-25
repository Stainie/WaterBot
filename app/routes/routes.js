const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    console.log('Heroku');
    res.send('Heroku');
});

router.get('/webhook', (req, res, next) => {

    let VERIFY_TOKEN = "stankos_verification_token";

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            res.sendStatus(403);
        }
    }
});

module.exports = router;