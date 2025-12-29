const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// GET /api/subjects
router.get('/', subjectController.getSubjects);

module.exports = router;
