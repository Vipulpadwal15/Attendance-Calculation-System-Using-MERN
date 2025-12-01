const express = require('express');
const Subject = require('../models/Subject');

const router = express.Router();

// List subjects, optionally filtered by teacherId
router.get('/', async (req, res) => {
  try {
    const { teacherId } = req.query;
    const filter = teacherId ? { teacherId } : {};
    const subjects = await Subject.find(filter).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: error.message });
  }
});

// Create subject
router.post('/', async (req, res) => {
  try {
    const { name, code, teacherId } = req.body;
    const subject = await Subject.create({ name, code, teacherId });
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create subject', error: error.message });
  }
});

module.exports = router;


