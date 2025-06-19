const User = require('../models/userModel');
const AnalysisHistory = require('../models/AnalysisHistory');
const FileData = require('../models/FileData');

// @desc    Get system-wide statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const [totalUsers, totalAnalyses, totalFiles] = await Promise.all([
      User.countDocuments(),
      AnalysisHistory.countDocuments(),
      FileData.countDocuments(),
    ]);
    res.json({
      totalUsers,
      totalAnalyses,
      totalFiles,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system statistics' });
  }
};

module.exports = { getSystemStats }; 