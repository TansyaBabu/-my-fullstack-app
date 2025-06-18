const asyncHandler = require('express-async-handler');
const multer = require('multer');
const xlsx = require('xlsx');
const FileData = require('../models/FileData');

// Configure Multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only .xlsx and .xls files are allowed!'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// @desc    Upload an Excel file and parse its data
// @route   POST /api/upload
// @access  Private
const uploadFile = asyncHandler(async (req, res) => {
    console.log('Upload request received:', {
        user: req.user ? { id: req.user._id, email: req.user.email } : 'no user',
        file: req.file ? {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        } : 'no file'
    });

    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const buffer = req.file.buffer;
    const fileName = req.file.originalname;

    try {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Save data to MongoDB
        const fileData = await FileData.create({
            user: req.user._id,
            fileName: fileName,
            data: data,
        });

        console.log('File data saved:', {
            fileId: fileData._id,
            fileName: fileData.fileName,
            userId: fileData.user
        });

        res.status(201).json({
            message: 'File uploaded and processed successfully',
            fileId: fileData._id,
            fileName: fileData.fileName,
            dataPreview: data.slice(0, 5) // Send a preview of the data
        });

    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500);
        throw new Error(`Error processing file: ${error.message}`);
    }
});

// @desc    Get all uploaded files for the authenticated user
// @route   GET /api/upload/history
// @access  Private
const getUploadHistory = asyncHandler(async (req, res) => {
    console.log('Get upload history request:', {
        user: req.user ? { id: req.user._id, email: req.user.email } : 'no user'
    });

    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    const files = await FileData.find({ user: req.user._id }).sort({ createdAt: -1 });

    console.log('Found files:', files.length);

    res.status(200).json(files.map(file => ({
        id: file._id,
        fileName: file.fileName,
        uploadDate: file.createdAt,
        dataSize: file.data.length,
    })));
});

// @desc    Get details of a specific uploaded file
// @route   GET /api/upload/:id
// @access  Private
const getFileData = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    const file = await FileData.findById(req.params.id);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    if (file.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to view this file');
    }

    res.status(200).json({
        id: file._id,
        fileName: file.fileName,
        uploadDate: file.createdAt,
        data: file.data,
    });
});

module.exports = {
    upload,
    uploadFile,
    getUploadHistory,
    getFileData,
}; 