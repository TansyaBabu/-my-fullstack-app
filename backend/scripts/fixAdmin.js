const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
require('dotenv').config();

const adminEmail = 'admin@gmail.com';
const adminUsername = 'admin';
const adminPassword = 'admin123';

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecting to MongoDB...');

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Upsert the admin user
        const result = await User.findOneAndUpdate(
            { email: adminEmail },
            {
                username: adminUsername,
                email: adminEmail,
                password: hashedPassword,
            isAdmin: true
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('Admin user upserted:', {
            id: result._id,
            email: result.email,
            isAdmin: result.isAdmin,
            username: result.username
        });

        // Verify the admin user
        const verifiedAdmin = await User.findOne({ email: adminEmail });
        console.log('Verified admin user:', {
            id: verifiedAdmin._id,
            email: verifiedAdmin.email,
            isAdmin: verifiedAdmin.isAdmin,
            username: verifiedAdmin.username
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error in fixAdmin.js:', error);
        process.exit(1);
    }
})();