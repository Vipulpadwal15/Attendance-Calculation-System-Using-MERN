const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Lecture = require('../models/Lecture');

const router = express.Router();

// Scan attendance for a lecture.
// Expects body: { lectureId, qrData: stringified JSON with student info }
router.post('/scan', async (req, res) => {
  const { lectureId, qrData } = req.body;

  if (!lectureId || !qrData) {
    return res.status(400).json({ message: 'lectureId and qrData are required.' });
  }

  try {
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR data format.' });
    }

    const { name, rollNo, contact, email } = parsed;
    if (!rollNo) {
      return res.status(400).json({ message: 'QR data must include rollNo.' });
    }

    // Ensure student exists (upsert by rollNo)
    let student = await Student.findOne({ rollNo });
    if (!student) {
      student = await Student.create({ name, rollNo, contact, email });
    }

    // Create attendance if not already present
    try {
      const attendance = await Attendance.create({
        student: student._id,
        lecture: lecture._id,
      });
      return res
        .status(201)
        .json({ message: 'Attendance recorded successfully!', attendance });
    } catch (error) {
      if (error.code === 11000) {
        // duplicate key due to unique index (student, lecture)
        return res.status(409).json({ message: 'Attendance already recorded for this student and lecture.' });
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Fetch attendance records for a student by roll number
router.get('/student/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const student = await Student.findOne({ rollNo });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const records = await Attendance.find({ student: student._id })
      .populate({
        path: 'lecture',
        populate: { path: 'subject' },
      })
      .sort({ scannedAt: -1 });

    res.json({ student, records });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
});

module.exports = router;
