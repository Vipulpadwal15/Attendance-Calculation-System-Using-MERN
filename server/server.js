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
  data: String,
});

const QrCode = mongoose.model('QrCode', qrCodeSchema);

// Endpoint to add QR code details
app.post('/api/qrcodes', async (req, res) => {
  const { data } = req.body;
  const qrCode = new QrCode({ data });

  try {
    await qrCode.save();
    res.status(201).json({ message: 'QR code data saved successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving QR code data', error: err });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
