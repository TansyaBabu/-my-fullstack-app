const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

async function addSampleUsers() {
  await mongoose.connect(process.env.MONGODB_URI);

  const now = new Date();
  const users = [
    { username: 'user1', email: 'user1@example.com', password: 'password1', createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
    { username: 'user2', email: 'user2@example.com', password: 'password2', createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) },
    { username: 'user3', email: 'user3@example.com', password: 'password3', createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
    { username: 'user4', email: 'user4@example.com', password: 'password4', createdAt: now },
  ];

  for (const user of users) {
    await User.create(user);
  }

  console.log('Sample users added!');
  await mongoose.disconnect();
}

addSampleUsers(); 