const AnalysisHistory = require('../models/AnalysisHistory');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Handle file upload
const uploadFile = async (req, res) => {
    try {
        console.log('Upload request received:', {
            file: req.file ? {
                originalname: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype
            } : 'No file',
            body: req.body,
            headers: req.headers
        });

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Validate file type
        const allowedTypes = ['.xlsx', '.xls'];
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            console.error('Invalid file type:', fileExt);
            // Clean up the uploaded file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: 'Only Excel files (.xlsx, .xls) are allowed' });
        }

        // Check if file exists
        if (!fs.existsSync(req.file.path)) {
            console.error('File not found at path:', req.file.path);
            return res.status(500).json({ message: 'File upload failed - file not found' });
        }

        // Validate required fields
        const xAxis = req.body.xAxis?.trim();
        const yAxis = req.body.yAxis?.trim();
        const chartType = req.body.chartType?.trim() || 'Bar';

        console.log('Form data received:', {
            xAxis,
            yAxis,
            chartType,
            body: req.body
        });

        if (!xAxis || !yAxis) {
            console.error('Missing required fields:', { xAxis, yAxis });
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ 
                message: 'X-axis and Y-axis column names are required',
                details: {
                    xAxis: xAxis ? 'valid' : 'missing',
                    yAxis: yAxis ? 'valid' : 'missing'
                }
            });
        }

        // Create new analysis history entry
        const analysisHistory = new AnalysisHistory({
            userId: req.user._id,
            fileName: req.file.originalname,
            fileId: req.file.filename,
            filePath: req.file.path,
            chartType: chartType,
            xAxis: xAxis,
            yAxis: yAxis,
            analysisDate: new Date()
        });

        // Save to database
        try {
            await analysisHistory.save();
            console.log('Analysis history saved successfully:', {
                id: analysisHistory._id,
                fileName: analysisHistory.fileName,
                xAxis: analysisHistory.xAxis,
                yAxis: analysisHistory.yAxis
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({ message: 'Failed to save analysis history' });
        }

        res.status(200).json({
            message: 'File uploaded successfully',
            file: {
                id: analysisHistory._id,
                name: analysisHistory.fileName,
                path: analysisHistory.filePath
            }
        });
    } catch (error) {
        console.error('Error in uploadFile:', error);
        
        // Clean up the uploaded file if it exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ 
            message: 'Error uploading file',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    uploadFile
}; 