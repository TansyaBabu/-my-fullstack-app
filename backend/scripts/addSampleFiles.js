const mongoose = require('mongoose');
const FileData = require('../models/FileData');
const User = require('../models/userModel');
require('dotenv').config();

async function addSampleFiles() {
  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOne(); // Assign files to the first user
  if (!user) {
    console.log('No users found. Add users first.');
    return;
  }

  const now = new Date();
  const files = [
    { user: user._id, fileName: 'file1.xlsx', data: [1,2,3], createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
    { user: user._id, fileName: 'file2.xlsx', data: [4,5,6], createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
    { user: user._id, fileName: 'file3.xlsx', data: [7,8,9], createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
    { user: user._id, fileName: 'file4.xlsx', data: [10,11,12], createdAt: now },
  ];

  for (const file of files) {
    await FileData.create(file);
  }

  console.log('Sample files added!');
  await mongoose.disconnect();
}

addSampleFiles(); 