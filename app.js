const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
const routes = require('./app/routes/routes');

/* ----- Connect to Database ----- */
mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;

const db = mongoose.connection;

/* ----- Reporting MongoDB connection ----- */
db.once('open', function(){
    console.log('Connected to MongoDB');
});

/* ----- Reporting DB Error ----- */
db.on('error', function(err){
    console.log('DATABASE ERROR: ' + err);
});

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