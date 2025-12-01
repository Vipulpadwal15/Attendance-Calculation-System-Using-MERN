const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Mongo connection error:', err));

// QR Code Schema – represents a single attendance scan (legacy)
const qrCodeSchema = new mongoose.Schema({
  data: {
    type: String,
    required: [true, 'QR code data is required'],
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const QrCode = mongoose.model('QrCode', qrCodeSchema);

// Mount REST routes for richer attendance model
const studentRoutes = require('./routes/students');
const subjectRoutes = require('./routes/subjects');
const lectureRoutes = require('./routes/lectures');
const attendanceRoutes = require('./routes/attendance');

app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/attendance', attendanceRoutes);

// Create a new attendance scan from QR code
app.post('/api/qrcodes', async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ message: 'QR code data is required' });
  }

  try {
    const existingAttendance = await QrCode.findOne({ data });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already saved' });
    }

    const newAttendance = new QrCode({ data });
    await newAttendance.save();

    return res.status(200).json({
      message: 'Attendance saved successfully',
      attendance: newAttendance,
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all attendance scans for dashboard
app.get('/api/qrcodes', async (req, res) => {
  try {
    const attendances = await QrCode.find().sort({ createdAt: 1 });
    return res.status(200).json(attendances);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
