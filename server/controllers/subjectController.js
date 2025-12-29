const Subject = require('../models/Subject');

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ name: 1 });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.seedSubjects = async () => {
    try {
        const count = await Subject.countDocuments();
        if (count === 0) {
            const subjects = [
                { name: 'Physics', code: 'PHY101' },
                { name: 'Chemistry', code: 'CHEM101' },
                { name: 'Mathematics', code: 'MATH101' },
                { name: 'Biology', code: 'BIO101' },
                { name: 'Hindi', code: 'HIN101' },
                { name: 'Marathi', code: 'MAR101' },
                { name: 'English', code: 'ENG101' }
            ];
            await Subject.insertMany(subjects);
            console.log('Subjects seeded successfully');
        }
    } catch (error) {
        console.error('Error seeding subjects:', error);
    }
};
