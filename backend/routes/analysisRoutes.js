const express = require('express');
const router = express.Router();
const AnalysisHistory = require('../models/AnalysisHistory');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const FileData = require('../models/FileData');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

// Debug: Check if AnalysisHistory model is loaded
console.log('AnalysisHistory model loaded:', !!AnalysisHistory);
console.log('AnalysisHistory model name:', AnalysisHistory.modelName);

// Test route to verify model is working
router.get('/test', protect, async (req, res) => {
    try {
        console.log('Testing AnalysisHistory model...');
        const count = await AnalysisHistory.countDocuments();
        console.log('AnalysisHistory count:', count);
        res.json({ message: 'AnalysisHistory model is working', count });
    } catch (error) {
        console.error('AnalysisHistory test error:', error);
        res.status(500).json({ message: 'AnalysisHistory model error', error: error.message });
    }
});

// Get analysis history
router.get('/history', protect, async (req, res) => {
    try {
        console.log('Fetching analysis history for user:', req.user._id, 'type:', typeof req.user._id);
        const history = await AnalysisHistory.find({ userId: req.user._id }).sort({ analysisDate: -1 });
        console.log('Found history count:', history.length);
        res.json(history);
    } catch (error) {
        console.error('Error fetching analysis history:', error);
        res.status(500).json({ message: 'Error fetching analysis history' });
    }
});

// Get chart data for a specific file
router.get('/data/:fileId', protect, async (req, res) => {
    try {
        const analysis = await AnalysisHistory.findOne({ fileId: req.params.fileId });
        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        const filePath = path.join(__dirname, '..', 'uploads', analysis.fileId);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        res.json({
            data,
            chartType: analysis.chartType,
            xAxis: analysis.xAxis,
            yAxis: analysis.yAxis
        });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ message: 'Error fetching chart data' });
    }
});

// Save new analysis
router.post('/save', protect, async (req, res) => {
    try {
        console.log('=== Analysis Save Request ===');
        console.log('User ID:', req.user._id);
        console.log('Request body:', req.body);
        
        const { fileId, fileName, chartType, xAxis, yAxis, summary } = req.body;
        
        // Validate required fields
        if (!fileId || !fileName || !chartType || !xAxis || !yAxis) {
            console.error('Missing required fields:', { fileId, fileName, chartType, xAxis, yAxis });
            return res.status(400).json({ 
                message: 'Missing required fields: fileId, fileName, chartType, xAxis, yAxis' 
            });
        }
        
        // Convert fileId to string if it's an ObjectId
        const fileIdString = fileId.toString();
        
        // Check if an analysis already exists for this file and user
        const existingAnalysis = await AnalysisHistory.findOne({
            userId: req.user._id,
            fileId: fileIdString
        });
        
        let savedAnalysis;
        
        if (existingAnalysis) {
            // Update existing analysis
            console.log('Updating existing analysis:', existingAnalysis._id);
            existingAnalysis.chartType = chartType;
            existingAnalysis.xAxis = xAxis;
            existingAnalysis.yAxis = yAxis;
            existingAnalysis.summary = summary;
            existingAnalysis.analysisDate = new Date();
            
            savedAnalysis = await existingAnalysis.save();
            console.log('Analysis updated successfully:', savedAnalysis);
        } else {
            // Create new analysis
            console.log('Creating new analysis with data:', {
                userId: req.user._id,
                fileId: fileIdString,
                fileName,
                chartType,
                xAxis,
                yAxis,
                summary
            });
        
        const newAnalysis = new AnalysisHistory({
                userId: req.user._id,
                fileId: fileIdString,
            fileName,
            chartType,
            xAxis,
            yAxis,
            summary
        });

            console.log('Analysis object created:', newAnalysis);
            
            savedAnalysis = await newAnalysis.save();
            console.log('Analysis saved successfully:', savedAnalysis);
        }
        
        res.status(201).json(savedAnalysis);
    } catch (error) {
        console.error('=== Analysis Save Error ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check if it's a validation error
        if (error.name === 'ValidationError') {
            console.error('Validation errors:', error.errors);
            return res.status(400).json({ 
                message: 'Validation error', 
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        // Check if it's a duplicate key error
        if (error.code === 11000) {
            console.error('Duplicate key error - this should not happen with the new logic');
            return res.status(409).json({ 
                message: 'Analysis already exists for this file. Please try again.' 
            });
        }
        
        res.status(500).json({ message: 'Error saving analysis' });
    }
});

// Download analysis data as CSV or JSON
router.get('/download/:fileId', protect, async (req, res) => {
    try {
        const analysis = await AnalysisHistory.findOne({ fileId: req.params.fileId, userId: req.user._id });
        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        const filePath = path.join(__dirname, '..', 'uploads', analysis.fileId);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // For simplicity, let's send as JSON for now. Can be extended to CSV.
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${analysis.fileName.replace('.xlsx', '') || 'download'}_${analysis.chartType}_${analysis.xAxis}_${analysis.yAxis}.json`);
        res.send(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
});

// AI API integration for summaries
router.post('/summarize/:fileId', protect, async (req, res) => {
    try {
        const analysis = await AnalysisHistory.findOne({ fileId: req.params.fileId, userId: req.user._id });
        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        const filePath = path.join(__dirname, '..', 'uploads', analysis.fileId);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Prepare a sample of the data for the AI (first 10 rows)
        const dataSample = data.slice(0, 10);
        const dataSampleString = JSON.stringify(dataSample, null, 2);

        let aiSummary = null;
        if (process.env.OPENAI_API_KEY) {
            try {
                const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
                const openai = new OpenAIApi(configuration);
                const prompt = `You are a data analyst. Summarize the following data table and provide key insights, trends, and any anomalies.\n\nData Sample:\n${dataSampleString}\n\nFocus on the relationship between ${analysis.xAxis} and ${analysis.yAxis} using a ${analysis.chartType} chart. Provide a concise summary for a business user.`;
                const completion = await openai.createChatCompletion({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful data analysis assistant.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 200
                });
                aiSummary = completion.data.choices[0].message.content.trim();
            } catch (aiError) {
                console.error('OpenAI API error:', aiError.response?.data || aiError.message);
                aiSummary = null;
            }
        }

        // Fallback to mock summary if AI fails or not configured
        const summary = aiSummary || `This is a simulated AI summary for the file '${analysis.fileName}'. It contains ${data.length} rows of data. The analysis focused on ${analysis.xAxis} vs ${analysis.yAxis} using a ${analysis.chartType} chart.`;

        // Update the analysis history with the summary
        analysis.summary = summary;
        await analysis.save();

        res.json({ summary });

    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({ message: 'Error generating summary' });
    }
});

// Chat with file endpoint
router.post('/chat', protect, async (req, res) => {
    try {
        const { message, fileId } = req.body;
        const userId = req.user._id;

        if (!message || !fileId) {
            return res.status(400).json({ message: 'Message and fileId are required' });
        }

        // Find the file data - using the correct field names from FileData model
        const fileData = await FileData.findOne({ 
            _id: fileId, 
            user: userId 
        });

        if (!fileData) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Simple AI response based on the message and data
        let response = '';
        
        if (message.toLowerCase().includes('trend') || message.toLowerCase().includes('pattern')) {
            response = `Based on the data in ${fileData.fileName}, I can see some interesting patterns. The data shows variations across different categories. To get more specific insights, you might want to create a chart visualization.`;
        } else if (message.toLowerCase().includes('highest') || message.toLowerCase().includes('maximum')) {
            response = `Looking at ${fileData.fileName}, I can help you identify the highest values. You can use the analysis feature to create charts that highlight maximum values in your data.`;
        } else if (message.toLowerCase().includes('insight') || message.toLowerCase().includes('find')) {
            response = `I can help you discover insights in ${fileData.fileName}. The data contains multiple columns that can be analyzed. Try creating different chart types to explore relationships between variables.`;
        } else if (message.toLowerCase().includes('summary') || message.toLowerCase().includes('overview')) {
            response = `Here's a summary of ${fileData.fileName}: The file contains structured data that can be analyzed for patterns, trends, and insights. You can use the analysis tools to create visualizations and get detailed insights.`;
        } else {
            response = `I can help you analyze ${fileData.fileName}. You can ask me about trends, patterns, highest values, or request insights. I can also help you understand how to use the analysis features effectively.`;
        }

        res.json({ response });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: 'Error processing chat request' });
    }
});

module.exports = router; 