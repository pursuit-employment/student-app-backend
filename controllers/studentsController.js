const express = require('express');
const controller = express.Router();

const {isValidEmail} = require('../utils/emailValidation');

const studentData = require('../studentData.json');

const db = require('../db/index');
const { response } = require('express');

controller.get('/', async (request, response) => {

    let {limit=25, min, max} = request.query; 

    limit = Number(limit);
    
    let studentDataForDelivery = await db.any('SELECT * FROM students');
    
    studentDataForDelivery = studentDataForDelivery.slice(0, limit);

    response.json(studentDataForDelivery);

});


// write a route to get a student by their full name

// implement min and max ids for get students

// write a route to get the grade average of a student by their id

// get all students sorted by their last name


// write a route that accepts a student id as part of the path
// returning an object (JSON), representing the student with that id

controller.get('/:id', async (request, response) => {
    try {
        const studentId = request.params.id;
        
        if(!/[0-9]/.test(studentId)){
            response.send('Student id must be a number.')
            return;
        }
        
        const singleStudent = await db.oneOrNone('SELECT * FROM students WHERE id = $1', [studentId]);
        
        if(singleStudent){
            response.json(singleStudent);
        } else {
            response.send('Student not found');
        }  
          
    } catch (err){
        response.status(500).send("An error occurred");
    }
})

controller.get('/:id/grades', async (req, res) => {

    try {  
        const studentId = req.params.id;

        const grades = await db.any('SELECT * FROM grades WHERE student_id = $1', [studentId]);

        grades.sort((a, b) => a.date - b.date);

        res.json(grades);
        
    } catch (err){
        res.status(500).send(err);
    }
});

controller.post('/', async(req, res) => {

    try {

        // get new student data from body     
        const {
            firstname, 
            lastname, 
            company, 
            city, 
            skill, 
            pic, 
            email} = req.body;

        // is an provided? must be provided

        if(!email){
            return res.send("Email is required.");
        }

        // is the email valid? must be valid
        if(!isValidEmail(email)){
            return res.send("Please provide a valid email.")
        }

        // save student to db
        const student = await db.one('INSERT INTO students (firstname, lastname, company, email, city, skill, pic) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
            [firstname, lastname, company, email, city, skill, pic]
        );

        // send a json response returning the new student
        res.json(student);

    } catch (err){
        res.status(500).send(err);
    }
})

controller.put('/:id', async(req, res) => {
    try {

        const studentId = req.params.id;
        const {firstname, lastname, email, company, city, skill, pic} = req.body;

        if(!email){
            return res.send("Email is required.");
        }

        // is the email valid? must be valid
        if(!isValidEmail(email)){
            return res.send("Please provide a valid email.")
        }

        const updatedUser = await db.one('UPDATE students SET firstname=$1, lastname=$2, email=$3, company=$4, city=$5, skill=$6, pic=$7 WHERE id=$8 RETURNING *', [firstname, lastname, email, company, city, skill, pic, studentId]);

        res.json(updatedUser);

    } catch(err){
        res.status(500).send(err);
    }
})

controller.delete('/:id', async (req, res) => {
    try {
        const studentId = req.params.id;

        await db.none('DELETE FROM grades WHERE student_id = $1', [studentId]);

        const deletedStudent = await db.one('DELETE FROM students WHERE id = $1 RETURNING *', [studentId]);

        res.json(deletedStudent);

    } catch (err){
        res.status(500).send(err);
    }
})

module.exports = controller;