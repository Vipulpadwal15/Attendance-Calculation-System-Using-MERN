const express = require('express');
const Student = require('../models/Student');

const router = express.Router();

// List all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});

// Create a student
router.post('/', async (req, res) => {
  try {
    const { name, rollNo, contact, email } = req.body;
    const student = await Student.create({ name, rollNo, contact, email });
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create student', error: error.message });
  }
});

module.exports = router;


