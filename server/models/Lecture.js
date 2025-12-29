const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Teacher Isolation
  date: { type: Date, required: true },
  lectureNumber: { type: Number },
  topic: { type: String },
  isActive: { type: Boolean, default: true }, // Session Control
  endTime: { type: Date } // Auto-expiry
}, { timestamps: true });

module.exports = mongoose.model('Lecture', lectureSchema);
