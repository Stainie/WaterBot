const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

/* ----- Logging Errors ----- */
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ 'extended': false }));    // parse application/x-www-form-urlencoded (not rich data)
app.use(bodyParser.json());                             // parse application/json from body

/* ----- Routes ----- */
app.get('/', (req, res, next) => {
    console.log('Heroku');
    res.send('Heroku');
});

app.get('/webhook', (req, res, next) => {

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

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message
    });
});

module.exports = app;