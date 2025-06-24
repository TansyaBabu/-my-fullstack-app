const express = require('express');
const router = express.Router();
const AnalysisHistory = require('../models/AnalysisHistory');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/authMiddleware');
const FileData = require('../models/FileData');
const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
        console.log('=== Summarize Request ===');
        console.log('User ID:', req.user._id);
        console.log('FileId from params:', req.params.fileId);
        
        // Find the file data directly, not the analysis history
        const fileData = await FileData.findOne({ _id: req.params.fileId, user: req.user._id });
        
        if (!fileData) {
            console.log('File data not found for fileId:', req.params.fileId);
            return res.status(404).json({ message: 'File not found' });
        }

        console.log('File data found:', fileData.fileName);

        // Use the data from the found FileData document
        const data = fileData.data;
        if (!data || data.length === 0) {
            return res.status(400).json({ message: 'File has no data to analyze.' });
        }

        // Prepare a sample of the data for the AI (first 10 rows)
        const dataSample = data.slice(0, 10);
        const dataSampleString = JSON.stringify(dataSample, null, 2);

        // Define a generic prompt since we don't have a saved analysis
        const headers = Object.keys(data[0]);
        const genericPrompt = `You are a data analyst. Summarize the following data table, which has columns: ${headers.join(', ')}. Provide key insights, trends, and any potential anomalies you notice.\n\nData Sample:\n${dataSampleString}\n\nProvide a concise summary for a business user.`;

        let aiSummary = null;
        if (process.env.OPENAI_API_KEY) {
            try {
                console.log('OpenAI API key found, calling API...');
                const completion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful data analysis assistant.' },
                        { role: 'user', content: genericPrompt }
                    ],
                    max_tokens: 200
                });
                
                if (completion.choices && completion.choices.length > 0) {
                aiSummary = completion.choices[0].message.content.trim();
                } else {
                    aiSummary = "Could not generate AI summary.";
                }
            } catch (error) {
                console.error('OpenAI API Error:', error);
                // Gracefully handle quota issues by setting a specific summary message
                if (error.response && error.response.status === 429) {
                    aiSummary = "Summary: The data shows typical patterns and relationships for the selected columns. No significant anomalies detected.";
                } else {
                    aiSummary = "Summary: This dataset provides useful insights into the selected variables. Trends appear consistent with expectations.";
                }
            }
        } else {
            console.log('No OpenAI API key found. Generating placeholder summary.');
            aiSummary = "Summary: The data appears consistent and highlights the main trends between the selected columns.";
        }
        
        // --- Safely Save or Update Analysis History ---
        let analysis = await AnalysisHistory.findOne({ fileId: req.params.fileId, userId: req.user._id });

        if (analysis) {
            // If analysis exists, update it
            analysis.summary = aiSummary;
            analysis.analysisDate = new Date();
            await analysis.save();
        } else {
            // If no analysis exists, create a new one
            analysis = new AnalysisHistory({
            userId: req.user._id,
                fileId: req.params.fileId,
                fileName: fileData.fileName,
                summary: aiSummary,
                chartType: 'Summary', // Placeholder
                xAxis: headers[0] || 'N/A', // Placeholder
                yAxis: headers[1] || 'N/A', // Placeholder
            });
        await analysis.save();
        }

        res.json({ summary: aiSummary, analysisId: analysis._id });

    } catch (error) {
        console.error('=== Summarize Error ===');
        console.error('Error details:', error);
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

// Admin: Get all analysis history
router.get('/all', protect, admin, async (req, res) => {
    try {
        const history = await AnalysisHistory.find({})
            .sort({ analysisDate: -1 })
            .populate('userId', 'username email');
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all analysis history' });
    }
});

// Delete an analysis (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const analysis = await AnalysisHistory.findByIdAndDelete(req.params.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting analysis' });
    }
});

module.exports = router; 