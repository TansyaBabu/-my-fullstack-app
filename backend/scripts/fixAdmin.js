const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

const fixAdmin = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fullstack-app';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Delete all existing users
        await User.deleteMany({});
        console.log('Deleted all existing users');

        // Create new admin user
        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            isAdmin: true
        });

        console.log('Created new admin user:', {
            id: adminUser._id,
            email: adminUser.email,
            isAdmin: adminUser.isAdmin,
            username: adminUser.username
        });

        // Verify the admin user
        const verifiedAdmin = await User.findOne({ email: 'admin@example.com' });
        console.log('Verified admin user:', {
            id: verifiedAdmin._id,
            email: verifiedAdmin.email,
            isAdmin: verifiedAdmin.isAdmin,
            username: verifiedAdmin.username
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixAdmin(); 