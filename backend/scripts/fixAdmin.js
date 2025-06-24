const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-db-name';

async function fixAdmin() {
    await mongoose.connect(MONGODB_URI);

    const email = 'admin@example.com';
    const password = 'admin123';

    let user = await User.findOne({ email });
    if (!user) {
        user = new User({
            username: 'admin',
            email,
            password: await bcrypt.hash(password, 10),
            isAdmin: true,
        });
        await user.save();
        console.log('Admin user created.');
    } else {
        user.isAdmin = true;
        user.password = await bcrypt.hash(password, 10);
        await user.save();
        console.log('Admin user updated.');
    }

    mongoose.disconnect();
}

fixAdmin();