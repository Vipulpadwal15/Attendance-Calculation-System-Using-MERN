const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// POST /api/attendance/scan - Mark attendance
router.post('/scan', attendanceController.markAttendance);

// GET /api/attendance/stats - Dashboard metrics
router.get('/stats', attendanceController.getStats);

module.exports = router;
