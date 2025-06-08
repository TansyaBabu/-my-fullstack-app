const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    upload,
    uploadFile,
    getUploadHistory,
    getFileData
} = require('../controllers/fileUploadController');

const router = express.Router();

router.route('/').post(protect, upload.single('excelFile'), uploadFile);
router.route('/history').get(protect, getUploadHistory);
router.route('/:id').get(protect, getFileData);

module.exports = router; 