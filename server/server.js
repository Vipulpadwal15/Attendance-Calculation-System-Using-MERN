const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const subjectController = require('./controllers/subjectController');

// Route Imports
const subjectRoutes = require('./routes/subjects');
const lectureRoutes = require('./routes/lectures');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-system', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('MongoDB connected');
    // Seed Subjects on startup
    await subjectController.seedSubjects();
  })
  .catch((err) => console.error('Mongo connection error:', err));

// API Routes
app.use('/api/subjects', subjectRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Attendance System API is Running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
