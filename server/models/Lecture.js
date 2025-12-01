const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true },
    topic: { type: String },
    lectureNumber: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lecture', lectureSchema);


