// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    qrData: { type: String, required: true, unique: true },
    scannedAt: { type: Date, default: Date.now }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
