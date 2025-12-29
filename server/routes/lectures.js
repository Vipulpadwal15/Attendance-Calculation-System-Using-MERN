const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');

// POST /api/lectures - Create new lecture
router.post('/', lectureController.createLecture);

// GET /api/lectures - List lectures
router.get('/', lectureController.getLectures);

module.exports = router;
