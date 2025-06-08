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
            user: req.user.id, // Assuming user ID is available from authentication middleware
            fileName: fileName,
            data: data,
        });

        res.status(201).json({
            message: 'File uploaded and processed successfully',
            fileId: fileData._id,
            fileName: fileData.fileName,
            dataPreview: data.slice(0, 5) // Send a preview of the data
        });

    } catch (error) {
        res.status(500);
        throw new Error(`Error processing file: ${error.message}`);
    }
});

// @desc    Get all uploaded files for the authenticated user
// @route   GET /api/upload/history
// @access  Private
const getUploadHistory = asyncHandler(async (req, res) => {
    const files = await FileData.find({ user: req.user.id }).sort({ createdAt: -1 });

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
    const file = await FileData.findById(req.params.id);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    if (file.user.toString() !== req.user.id) {
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