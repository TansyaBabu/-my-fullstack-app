const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        console.log('Request body:', req.body);

        // Check if user exists
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');
        if (user) {
            console.log('User details:', {
                id: user._id,
                email: user.email,
                username: user.username,
                isAdmin: user.isAdmin
            });
        }
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        console.log('Attempting password comparison');
        const isValidPassword = await user.comparePassword(password);
        console.log('Password comparison result:', isValidPassword);

        if (!isValidPassword) {
            console.log('Invalid password for:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Send response
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            token
        };

        console.log('Login successful for:', email);
        console.log('Sending response:', { message: 'Login successful', user: { ...userResponse, password: '[REDACTED]' } });
        
        res.status(200).json({
            message: 'Login successful',
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Registration attempt for:', email);
        console.log('Request body:', { ...req.body, password: '[REDACTED]' });

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        console.log('Creating new user...');
        const user = new User({
            username,
            email,
            password // The password will be hashed by the pre-save middleware
        });

        console.log('Saving user to database...');
        await user.save();
        console.log('User saved successfully:', {
            id: user._id,
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Send response
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            token
        };

        console.log('Sending registration response:', { 
            message: 'User registered successfully', 
            user: { ...userResponse, password: '[REDACTED]' } 
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or username already exists' });
        }
        res.status(500).json({ message: 'Error during registration' });
    }
};

module.exports = {
    login,
    register
}; 