//import code for express
const express = require('express');

// initialize app
const app = express();

const studentsController = require('./controllers/studentsController');

app.use('/students', studentsController);

// route
app.get('/', (request, response) => {
    response.send("Hello world!");
});

// export app
module.exports = app;