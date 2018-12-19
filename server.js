'use strict';

// Load array of notes
const express = require('express');
const { PORT } = require('./config');
const morgan = require('morgan');
const notesRouter = require('./router/notes.router');
const app = express(); 

// Middleware
// log all requests
app.use(morgan('dev'));

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());


// Routes
app.use('/api', notesRouter);

// Error handling
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({message: 'Not Found'});
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

// ADD STATIC SERVER....
app.listen(PORT, function() {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => console.log(err));