const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser,
    getUserProfile, 
    getUsers,
    deleteUser,
    getUserById,
    updateUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/userModel');

// Public routes
router.post('/', registerUser); // Register user
router.post('/login', loginUser); // Login user

// Protected user routes
router.route('/profile').get(protect, getUserProfile); // Get user profile

// Update user profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user._id;

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Change password
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        // Get user with password
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

// Admin-only user management routes
router.route('/').get(protect, admin, getUsers); // List all users
router.route('/:id')
    .get(protect, admin, getUserById) // Get user by ID
    .put(protect, admin, updateUser) // Update user
    .delete(protect, admin, deleteUser); // Delete user

module.exports = router; 