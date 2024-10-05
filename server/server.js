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
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// QR Code Schema
const qrCodeSchema = new mongoose.Schema({
  data: {
    type: String,
    required: [true, 'QR code data is required'], // Custom validation message
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const QrCode = mongoose.model('QrCode', qrCodeSchema);

// Endpoint to add QR code details
// Backend Route for QR Code Scanning
app.post('/api/qrcodes', async (req, res) => {
  console.log('Incoming request body:', req.body); // Log the entire request body
  const { data } = req.body;
  console.log('Received QR Code data:', data);

  try {
      // Check if the QR code data already exists in the database
      const existingAttendance = await QrCode.findOne({ data });
      
      if (existingAttendance) {
          console.log('Attendance already saved for QR code:', data);
          return res.status(400).json({ message: 'Attendance already saved' });
      }

      // Save new attendance
      const newAttendance = new QrCode({ data });
      await newAttendance.save();
      console.log('Attendance saved successfully for QR code:', data);

      return res.status(200).json({ message: 'Attendance saved successfully' });
  } catch (error) {
      console.error('Error saving attendance:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
