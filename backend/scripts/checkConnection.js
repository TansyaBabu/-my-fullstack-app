const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

const checkConnection = async () => {
    try {
        // Check environment variables
        console.log('Environment Variables:');
        console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
        console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

        // Connect to MongoDB
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fullstack-app';
        console.log('\nAttempting to connect to MongoDB...');
        console.log('MongoDB URI:', mongoURI);
        
        await mongoose.connect(mongoURI);
        console.log('Successfully connected to MongoDB');

        // Check admin user
        const adminUser = await User.findOne({ email: 'admin@example.com' });
        console.log('\nAdmin User Check:');
        console.log('Admin user exists:', adminUser ? 'Yes' : 'No');

        if (adminUser) {
            console.log('Admin user details:', {
                id: adminUser._id,
                email: adminUser.email,
                isAdmin: adminUser.isAdmin,
                username: adminUser.username
            });

            // Test password
            const isMatch = await adminUser.matchPassword('admin123');
            console.log('\nPassword Test:');
            console.log('Password matches:', isMatch ? 'Yes' : 'No');
        } else {
            console.log('\nCreating new admin user...');
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

checkConnection(); 