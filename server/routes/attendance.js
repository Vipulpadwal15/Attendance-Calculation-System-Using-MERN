// routes/attendance.js
const express = require('express');
const Attendance = require('../models/Attendance');

const router = express.Router();

router.post('/scan', async (req, res) => {
    const { qrData } = req.body;

    try {
        // Check if the attendance entry already exists
        const existingEntry = await Attendance.findOne({ qrData });

        if (existingEntry) {
            return res.status(409).json({ message: 'Data already exists.' });
        }

        // If it doesn't exist, save the new entry
        const newEntry = new Attendance({ qrData });
        await newEntry.save();

        res.status(201).json({ message: 'Attendance recorded successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

module.exports = router;
