const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
    upload,
    uploadFile,
    getUploadHistory,
    getFileData,
    getAllFilesAdmin,
    deleteFile
} = require('../controllers/fileUploadController');
const FileData = require('../models/FileData');

const router = express.Router();

router.route('/').post(protect, upload.single('excelFile'), uploadFile);
router.route('/history').get(protect, getUploadHistory);
router.route('/all').get(protect, getAllFilesAdmin);

// Get user's uploaded files
router.get('/files', protect, async (req, res) => {
    try {
        const files = await FileData.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        
        const responseFiles = files.map(file => ({
            _id: file._id,
            fileName: file.fileName,
            createdAt: file.createdAt
        }));

        res.json(responseFiles);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching files' });
    }
});

router.route('/:id').get(protect, getFileData).delete(protect, admin, deleteFile);

module.exports = router; 