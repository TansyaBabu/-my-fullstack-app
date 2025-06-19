const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getSystemStats } = require('../controllers/adminController');

// System-wide statistics
router.get('/stats', protect, admin, getSystemStats);

module.exports = router; 