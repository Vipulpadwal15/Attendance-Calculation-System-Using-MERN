const Attendance = require('../models/Attendance');
const Lecture = require('../models/Lecture');
const User = require('../models/User');

exports.markAttendance = async (req, res) => {
    try {
        const { lectureId, qrData } = req.body;

        // Validate inputs
        if (!lectureId || !qrData) {
            return res.status(400).json({ message: 'Missing lectureId or qrData' });
        }

        // 1. Verify Lecture exists
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

        // 2. Active Session Check
        if (!lecture.isActive) {
            return res.status(400).json({ message: 'Session contains Inactive or Expired status' });
        }

        // 3. Time Expiry Check (Safety)
        if (lecture.endTime && new Date() > new Date(lecture.endTime)) {
            lecture.isActive = false;
            await lecture.save();
            return res.status(400).json({ message: 'Session Timed Out' });
        }

        // Parse QR
        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid QR Format' });
        }

        const { email, userId, rollNo } = parsedData;

        let student;
        if (userId) {
            student = await User.findById(userId);
        } else if (email) {
            student = await User.findOne({ email });
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found in system' });
        }

        // Create Attendance bound to Teacher
        try {
            const attendance = await Attendance.create({
                student: student._id,
                lecture: lectureId,
                teacher: lecture.teacher,
                status: 'present'
            });

            res.status(201).json({
                message: 'Attendance Marked',
                attendance: {
                    ...attendance.toObject(),
                    student: { name: student.name, rollNo: rollNo || 'N/A' }
                }
            });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({ message: 'Attendance already recorded' });
            }
            throw err;
        }

    } catch (error) {
        console.error('Scan Error:', error);
        res.status(500).json({ message: 'Server Error during scan' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const { teacherId, email } = req.query;
        let filter = {};

        // Resolve Teacher ID if email passed
        let resolvedTeacherId = teacherId;
        if (!resolvedTeacherId && email) {
            const user = await User.findOne({ email });
            if (user) resolvedTeacherId = user._id;
        }

        // Strict Isolation
        if (resolvedTeacherId) {
            filter.teacher = resolvedTeacherId;
        }

        const totalLectures = resolvedTeacherId
            ? await Lecture.countDocuments({ teacher: resolvedTeacherId })
            : await Lecture.countDocuments();

        const presentCount = await Attendance.countDocuments({ ...filter, status: 'present' });

        // Estimate
        const totalStudents = await User.countDocuments({ role: 'student' });
        const possibleAttendance = totalLectures * (totalStudents || 1);

        const absentCount = Math.max(0, possibleAttendance - presentCount);
        const attendancePercentage = possibleAttendance ? ((presentCount / possibleAttendance) * 100).toFixed(1) : 0;

        res.json({
            totalLectures,
            presentCount,
            absentCount,
            attendancePercentage
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};
