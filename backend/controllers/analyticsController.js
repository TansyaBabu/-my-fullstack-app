const User = require('../models/userModel');
const AnalysisHistory = require('../models/AnalysisHistory');
const FileData = require('../models/FileData');

// Helper function to get date range
const getDateRange = (range) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (range) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }
  
  return { startDate, endDate: now };
};

// @desc    Get user analytics
// @route   GET /api/admin/analytics/users
// @access  Private/Admin
const getUserAnalytics = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
    
    res.json({
      totalUsers,
      newUsers,
      activeUsers: newUsers, // Using new users as active users since we don't track lastLogin
      growthRate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Error fetching user analytics' });
  }
};

// @desc    Get file upload analytics
// @route   GET /api/admin/analytics/files
// @access  Private/Admin
const getFileAnalytics = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    const totalFiles = await FileData.countDocuments();
    const newFiles = await FileData.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
    
    // Get all files to calculate total data entries
    const allFiles = await FileData.find({}, 'data');
    const totalDataEntries = allFiles.reduce((total, file) => total + (file.data?.length || 0), 0);
    
    res.json({
      totalFiles,
      newFiles,
      totalDataEntries,
      averageEntriesPerFile: totalFiles > 0 ? Math.round(totalDataEntries / totalFiles) : 0
    });
  } catch (error) {
    console.error('File analytics error:', error);
    res.status(500).json({ message: 'Error fetching file analytics' });
  }
};

// @desc    Get analysis analytics
// @route   GET /api/admin/analytics/analyses
// @access  Private/Admin
const getAnalysisAnalytics = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    const [totalAnalyses, newAnalyses, chartTypes] = await Promise.all([
      AnalysisHistory.countDocuments(),
      AnalysisHistory.countDocuments({ analysisDate: { $gte: startDate, $lte: endDate } }),
      AnalysisHistory.aggregate([
        { $group: { _id: "$chartType", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    
    res.json({
      totalAnalyses,
      newAnalyses,
      chartTypes: chartTypes.reduce((acc, type) => {
        acc[type._id] = type.count;
        return acc;
      }, {}),
      mostPopularChart: chartTypes[0]?._id || 'None'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analysis analytics' });
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics/system
// @access  Private/Admin
const getSystemAnalytics = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    // Calculate system metrics
    const totalUsers = await User.countDocuments();
    const totalFiles = await FileData.countDocuments();
    const totalAnalyses = await AnalysisHistory.countDocuments();
    
    // Mock system health data (in a real app, this would come from monitoring)
    const uptime = 99.9;
    const responseTime = Math.random() * 100 + 50; // Mock response time
    const errorRate = Math.random() * 2; // Mock error rate
    
    res.json({
      uptime,
      responseTime: responseTime.toFixed(2),
      errorRate: errorRate.toFixed(2),
      totalUsers,
      totalFiles,
      totalAnalyses,
      systemLoad: Math.random() * 100 // Mock system load
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system analytics' });
  }
};

// @desc    Get recent activity
// @route   GET /api/admin/analytics/activity
// @access  Private/Admin
const getRecentActivity = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    const [recentUsers, recentFiles, recentAnalyses] = await Promise.all([
      User.find({ createdAt: { $gte: startDate, $lte: endDate } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username email createdAt'),
      FileData.find({ createdAt: { $gte: startDate, $lte: endDate } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'username')
        .select('fileName createdAt user'),
      AnalysisHistory.find({ analysisDate: { $gte: startDate, $lte: endDate } })
        .sort({ analysisDate: -1 })
        .limit(5)
        .populate('userId', 'username')
        .select('fileName chartType analysisDate userId')
    ]);
    
    // Combine and format activities
    const activities = [];
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registration',
        description: `New user registered: ${user.username}`,
        timestamp: user.createdAt,
        user: user.username
      });
    });
    
    recentFiles.forEach(file => {
      activities.push({
        type: 'file_upload',
        description: `File uploaded: ${file.fileName}`,
        timestamp: file.createdAt,
        user: file.user?.username || 'Unknown'
      });
    });
    
    recentAnalyses.forEach(analysis => {
      activities.push({
        type: 'analysis_created',
        description: `Analysis created: ${analysis.chartType} chart for ${analysis.fileName}`,
        timestamp: analysis.analysisDate,
        user: analysis.userId?.username || 'Unknown'
      });
    });
    
    // Sort by timestamp and limit to 10 most recent
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(activities.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
};

// @desc    Get detailed analytics dashboard data
// @route   GET /api/admin/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    const [
      userStats,
      fileStats,
      analysisStats,
      systemStats,
      recentActivity
    ] = await Promise.all([
      getUserAnalytics({ query: { range } }, { json: () => {} }),
      getFileAnalytics({ query: { range } }, { json: () => {} }),
      getAnalysisAnalytics({ query: { range } }, { json: () => {} }),
      getSystemAnalytics({ query: { range } }, { json: () => {} }),
      getRecentActivity({ query: { range } }, { json: () => {} })
    ]);
    
    res.json({
      userStats,
      fileStats,
      analysisStats,
      systemStats,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard analytics' });
  }
};

// @desc    Get user registration trend
// @route   GET /api/admin/analytics/user-growth
// @access  Private/Admin
const getUserGrowthTrend = async (req, res) => {
  const { range = '30d' } = req.query;
  const { startDate, endDate } = getDateRange(range);

  // Group by day
  const trend = await User.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  res.json(trend);
};

// @desc    Get file upload trend
// @route   GET /api/admin/analytics/file-uploads
// @access  Private/Admin
const getFileUploadTrend = async (req, res) => {
  const { range = '30d' } = req.query;
  const { startDate, endDate } = getDateRange(range);

  // Group by day
  const trend = await FileData.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  res.json(trend);
};

module.exports = {
  getUserAnalytics,
  getFileAnalytics,
  getAnalysisAnalytics,
  getSystemAnalytics,
  getRecentActivity,
  getDashboardAnalytics,
  getUserGrowthTrend,
  getFileUploadTrend
}; 