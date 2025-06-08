const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

const verifyAdmin = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fullstack-app';
        console.log('Attempting to connect to MongoDB with URI:', mongoURI);
        
        await mongoose.connect(mongoURI);
        console.log('Successfully connected to MongoDB');

        // Check if admin exists
        const adminUser = await User.findOne({ email: 'admin@example.com' });
        console.log('Admin user found:', adminUser ? 'Yes' : 'No');

        if (adminUser) {
            console.log('Admin user details:', {
                id: adminUser._id,
                email: adminUser.email,
                isAdmin: adminUser.isAdmin,
                username: adminUser.username
            });
        } else {
            console.log('Creating new admin user...');
            const newAdmin = await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                isAdmin: true
            });
            console.log('New admin created:', {
                id: newAdmin._id,
                email: newAdmin.email,
                isAdmin: newAdmin.isAdmin,
                username: newAdmin.username
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyAdmin(); 