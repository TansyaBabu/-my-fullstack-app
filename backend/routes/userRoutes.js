const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser,
    getUserProfile, 
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    updateUserProfile,
    updateUserPassword
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/userModel');

// Public routes
router.post('/', registerUser); // Register user
router.post('/login', loginUser); // Login user

// Protected user routes
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile); // Get and update user profile

// Change password
router.put('/password', protect, updateUserPassword);

// Admin-only user management routes
router.route('/').get(protect, admin, getUsers); // List all users
router.route('/:id')
    .get(protect, admin, getUserById) // Get user by ID
    .put(protect, admin, updateUser) // Update user
    .delete(protect, admin, deleteUser); // Delete user

module.exports = router; 