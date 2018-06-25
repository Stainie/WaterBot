const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const routes = require('./app/routes/routes');

/* ----- Logging Errors ----- */
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ 'extended': false }));    // parse application/x-www-form-urlencoded (not rich data)
app.use(bodyParser.json());                             // parse application/json from body

/* ----- Routes ----- */
app.use('/', routes);

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