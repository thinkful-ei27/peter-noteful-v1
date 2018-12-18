'use strict';

// Load array of notes
const express = require('express');
const data = require('./db/notes');
const simDB = require('./db/simDB');
const notes = simDB.initialize(data);
const { PORT } = require('./config');
const { requestLogger } = require('./middleware/logger');
const app = express(); 

// Middleware
// log all requests
app.use(requestLogger);

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());


// Routes
app.get('/api/notes', (req, res, next) => {
  const { searchTerm } = req.query;

  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});

app.get('/api/notes/:id', (req, res, next) => {
  const { id } = req.params;

  notes.find(id, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});

app.put('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;

  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  notes.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});



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