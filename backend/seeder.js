const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
const connectDB = require('./config/db');

// Connect to database
connectDB();

// Admin user data
const adminUser = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    isAdmin: true
};

// Import data
const importData = async () => {
    try {
        // Clear existing users
        await User.deleteMany();

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminUser.password, salt);
        
        const createdUser = await User.create({
            ...adminUser,
            password: hashedPassword
        });

        console.log('Admin user created successfully:', {
            username: createdUser.username,
            email: createdUser.email,
            isAdmin: createdUser.isAdmin
        });
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData(); 