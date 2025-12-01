const express = require('express');
const Lecture = require('../models/Lecture');

const router = express.Router();

// List lectures, optionally by subject
router.get('/', async (req, res) => {
  try {
    const { subjectId } = req.query;
    const filter = subjectId ? { subject: subjectId } : {};
    const lectures = await Lecture.find(filter)
      .populate('subject')
      .sort({ date: -1 });
    res.json(lectures);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lectures', error: error.message });
  }
});

// Create lecture
router.post('/', async (req, res) => {
  try {
    const { subjectId, date, topic, lectureNumber } = req.body;
    const lecture = await Lecture.create({
      subject: subjectId,
      date,
      topic,
      lectureNumber,
    });
    res.status(201).json(lecture);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create lecture', error: error.message });
  }
});

module.exports = router;


