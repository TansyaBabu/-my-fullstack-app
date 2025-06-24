const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getUserAnalytics,
  getFileAnalytics,
  getAnalysisAnalytics,
  getSystemAnalytics,
  getRecentActivity,
  getDashboardAnalytics,
  getUserGrowthTrend,
  getFileUploadTrend
} = require('../controllers/analyticsController');

// All analytics routes require admin access
router.use(protect, admin);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics routes are working', timestamp: new Date() });
});

// User analytics
router.get('/users', getUserAnalytics);

// File analytics
router.get('/files', getFileAnalytics);

// Analysis analytics
router.get('/analyses', getAnalysisAnalytics);

// System analytics
router.get('/system', getSystemAnalytics);

// Recent activity
router.get('/activity', getRecentActivity);

// Dashboard analytics (combined)
router.get('/dashboard', getDashboardAnalytics);

// User growth trend
router.get('/user-growth', getUserGrowthTrend);

// File upload trend
router.get('/file-uploads', getFileUploadTrend);

module.exports = router; 