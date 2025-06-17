const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        console.log('Login attempt - Received body:', req.body);

        // Check if user exists
        const user = await User.findOne({ email: req.body.email });
        console.log('Login attempt - User found:', user ? user.email : 'None');
        if (!user) {
            console.log('User not found:', req.body.email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        console.log('Login attempt - Stored password hash (for debugging):', user.password);
        console.log('Login attempt - Password provided (for debugging):', req.body.password);
        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        console.log('Login attempt - Password comparison result:', isValidPassword);

        if (!isValidPassword) {
            console.log('Invalid password for user:', req.body.email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Send response
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Login error (backend):', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error during registration' });
    }
};

module.exports = {
    login,
    register
}; 