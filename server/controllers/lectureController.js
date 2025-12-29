const Lecture = require('../models/Lecture');
const User = require('../models/User');

exports.createLecture = async (req, res) => {
    try {
        const { subjectId, date, topic, lectureNumber, teacherId, email, durationInMinutes = 60 } = req.body;

        // Resolve Teacher
        let teacher = null;
        if (teacherId) {
            teacher = await User.findById(teacherId);
        } else if (email) {
            teacher = await User.findOne({ email });
        }

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found. Please ensure you are registered in the backend.' });
        }

        // Basic validation
        if (!subjectId || !date) {
            return res.status(400).json({ message: 'Subject and Date are required' });
        }

        // Deactivate ANY previous active sessions for this teacher
        await Lecture.updateMany(
            { teacher: teacher._id, isActive: true },
            { isActive: false }
        );

        const endTime = new Date(new Date(date).getTime() + durationInMinutes * 60000);

        const lecture = await Lecture.create({
            subject: subjectId,
            teacher: teacher._id,
            date,
            topic,
            lectureNumber,
            isActive: true,
            endTime
        });

        res.status(201).json(lecture);
    } catch (error) {
        console.error('Create Lecture Error:', error);
        res.status(500).json({ message: 'Failed to create lecture', error: error.message });
    }
};

exports.getLectures = async (req, res) => {
    try {
        const lectures = await Lecture.find().populate('subject').sort({ date: -1 });
        res.json(lectures);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch lectures', error: error.message });
    }
};
