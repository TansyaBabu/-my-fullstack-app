const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { cleanData } = require('../controllers/dataProcessingController');

// @desc    Clean and process data from a file
// @route   POST /api/process/clean/:fileId
// @access  Private
router.post('/clean/:fileId', protect, cleanData);

module.exports = router; 