const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadFile, getAllFilesAdmin, getFileData } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');
const FileData = require('../models/FileData');

// Admin: Get all uploaded files (paginated)
router.get('/all', protect, admin, getAllFilesAdmin);

router.post('/', upload.single('excelFile'), uploadFile);

// Get user's uploaded files
router.get('/files', protect, async (req, res) => {
    try {
        const files = await FileData.find({ user: req.user._id })
            .select('_id fileName createdAt')
            .sort({ createdAt: -1 });
        
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching files' });
    }
});

// Get a single file by ID
router.get('/:id', protect, getFileData);

module.exports = router; 