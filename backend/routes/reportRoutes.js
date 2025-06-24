const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateReport } = require('../controllers/reportController');

router.post('/generate', protect, generateReport);

module.exports = router; 