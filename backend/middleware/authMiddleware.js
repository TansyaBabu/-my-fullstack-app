const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            // Get user from the token using userId instead of id
            const user = await User.findById(decoded.userId).select('-password');
            console.log('Found user:', user ? { id: user._id, email: user.email } : 'null');

            if (!user) {
                res.status(401);
                throw new Error('User not found');
            }

            // Set user in request
            req.user = user;
            console.log('Set user in request:', { id: req.user._id, email: req.user.email });

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.status(401);
            throw new Error('Not authorized');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, admin }; 