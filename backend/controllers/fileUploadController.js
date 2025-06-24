const asyncHandler = require('express-async-handler');
const multer = require('multer');
const xlsx = require('xlsx');
const FileData = require('../models/FileData');
const mongoose = require('mongoose');
const AnalysisHistory = require('../models/AnalysisHistory');

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
    console.log(`Fetching upload history for user ID: ${req.user._id}`);

    // Explicitly cast the user ID to an ObjectId for a robust query
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const files = await FileData.find({ user: userId }).sort({ createdAt: -1 });

    console.log(`Database query found ${files.length} files for this user.`);

    const responseData = files.map(file => ({
        id: file._id,
        fileName: file.fileName || 'Untitled',
        uploadDate: file.createdAt || null,
        dataSize: (file.rowCount != null) ? file.rowCount : (Array.isArray(file.data) ? file.data.length : 0),
    }));

    // Log the exact data being sent to the frontend
    console.log('Sending file data to frontend:', JSON.stringify(responseData, null, 2));

    res.status(200).json(responseData);
});

// @desc    Get details of a specific uploaded file
// @route   GET /api/upload/:id
// @access  Private
const getFileData = asyncHandler(async (req, res) => {
    if (req.params.id === 'all') {
        res.status(400);
        throw new Error('Invalid file ID');
    }

    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    const file = await FileData.findById(req.params.id);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    // Allow if user is owner OR user is admin
    if (file.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
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

// @desc    Get all uploaded files (admin, paginated)
// @route   GET /api/upload/all?page=1&limit=10
// @access  Private/Admin
const getAllFilesAdmin = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
        FileData.find({})
            .populate('user', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        FileData.countDocuments()
    ]);

    res.status(200).json({
        files: files.map(file => ({
            id: file._id,
            fileName: file.fileName,
            uploadDate: file.createdAt,
            dataSize: file.data.length,
            uploader: file.user ? {
                id: file.user._id,
                username: file.user.username,
                email: file.user.email
            } : null
        })),
        page,
        totalPages: Math.ceil(total / limit),
        totalFiles: total
    });
});

// @desc    Delete a file (admin only)
// @route   DELETE /api/upload/:id
// @access  Private/Admin
const deleteFile = asyncHandler(async (req, res) => {
    const file = await FileData.findById(req.params.id);
    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }
    // Cascade delete: remove all analyses for this file (fileId is a string)
    await AnalysisHistory.deleteMany({ fileId: file._id.toString() });
    await file.deleteOne();
    res.json({ message: 'File and associated charts deleted successfully' });
});

module.exports = {
    upload,
    uploadFile,
    getUploadHistory,
    getFileData,
    getAllFilesAdmin,
    deleteFile,
}; 