const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

const checkAndCreateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fullstack-app');
        console.log('Connected to MongoDB');

        // Check if admin exists
        const adminUser = await User.findOne({ email: 'admin@example.com' });
        console.log('Current admin user:', adminUser);

        if (!adminUser) {
            console.log('Creating new admin user...');
            const newAdmin = await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                isAdmin: true
            });
            console.log('New admin created:', newAdmin);
        } else {
            // Update existing admin to ensure isAdmin is true
            adminUser.isAdmin = true;
            await adminUser.save();
            console.log('Updated existing admin user:', adminUser);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAndCreateAdmin(); 