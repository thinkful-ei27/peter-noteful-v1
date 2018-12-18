'use strict';

// Load array of notes
const express = require('express');
const data = require('./db/notes');
const { PORT } = require('./config');
const app = express(); 

// ADD STATIC SERVER....
app.listen(PORT, function() {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => console.log(err));

app.get('/api/notes', (req, res) => {
  const searchTerm = req.query.searchTerm;
  if (searchTerm) {
    let results = data.filter(item => item.title.includes(searchTerm));
    res.json(results);
  } else {
    res.json(data);
  }
});

app.get('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  let note = data.find(item => item.id === Number(id));
  res.json(note);
});
