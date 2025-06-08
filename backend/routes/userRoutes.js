const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser,
    getUserProfile, 
    // getUsers, // Remove admin controller
    // deleteUser, // Remove admin controller
    // getUserById, // Remove admin controller
    // updateUser // Remove admin controller
} = require('../controllers/userController');
const { protect /* , admin */ } = require('../middleware/authMiddleware'); // Remove admin middleware

// Public routes
router.post('/', registerUser); // Register user
router.post('/login', loginUser); // Login user

// Protected routes
router.route('/profile').get(protect, getUserProfile); // Get user profile

// Removed Admin routes:
// router.route('/').get(protect, admin, getUsers);
// router
//     .route('/:id')
//     .delete(protect, admin, deleteUser)
//     .get(protect, admin, getUserById)
//     .put(protect, admin, updateUser);

module.exports = router; 