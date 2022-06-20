//import code for express
const express = require('express');

// initialize app
const app = express();

const studentsController = require('./controllers/studentsController');
const namesController = require('./controllers/namesController');

app.use('/students', studentsController);
app.use('/names', namesController);

// route
app.get('/', (request, response) => {
    response.send("Hello world!");
});

// export app
module.exports = app;