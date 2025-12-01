const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    teacherId: { type: String, required: true }, // Firebase auth uid of teacher
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);


