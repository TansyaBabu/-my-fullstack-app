const mongoose = require('mongoose');
const User = require('./models/userModel');
const FileData = require('./models/FileData');
const AnalysisHistory = require('./models/AnalysisHistory');
require('dotenv').config();

async function testAnalytics() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test basic queries
    console.log('\n=== Testing Basic Queries ===');
    
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    
    const totalFiles = await FileData.countDocuments();
    console.log('Total files:', totalFiles);
    
    const totalAnalyses = await AnalysisHistory.countDocuments();
    console.log('Total analyses:', totalAnalyses);

    // Test file data structure
    console.log('\n=== Testing File Data Structure ===');
    const sampleFile = await FileData.findOne();
    if (sampleFile) {
      console.log('Sample file data type:', typeof sampleFile.data);
      console.log('Sample file data length:', sampleFile.data?.length || 0);
      console.log('Sample file data structure:', Array.isArray(sampleFile.data) ? 'Array' : 'Not Array');
    } else {
      console.log('No files found');
    }

    // Test date range queries
    console.log('\n=== Testing Date Range Queries ===');
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo, $lte: now } 
    });
    console.log('New users in last 7 days:', newUsers);
    
    const newFiles = await FileData.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo, $lte: now } 
    });
    console.log('New files in last 7 days:', newFiles);

    console.log('\n=== Test Completed Successfully ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAnalytics(); 