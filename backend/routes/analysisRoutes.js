const express = require('express');
const router = express.Router();
const AnalysisHistory = require('../models/AnalysisHistory');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/authMiddleware');

// Get analysis history
router.get('/history', auth, async (req, res) => {
    try {
        const history = await AnalysisHistory.find({ userId: req.user.id }).sort({ analysisDate: -1 });
        res.json(history);
    } catch (error) {
        console.error('Error fetching analysis history:', error);
        res.status(500).json({ message: 'Error fetching analysis history' });
    }
});

// Get chart data for a specific file
router.get('/data/:fileId', async (req, res) => {
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
router.post('/save', auth, async (req, res) => {
    try {
        const { fileId, fileName, chartType, xAxis, yAxis, summary } = req.body;
        
        const newAnalysis = new AnalysisHistory({
            userId: req.user.id,
            fileId,
            fileName,
            chartType,
            xAxis,
            yAxis,
            summary
        });

        await newAnalysis.save();
        res.status(201).json(newAnalysis);
    } catch (error) {
        console.error('Error saving analysis:', error);
        res.status(500).json({ message: 'Error saving analysis' });
    }
});

// Download analysis data as CSV or JSON
router.get('/download/:fileId', auth, async (req, res) => {
    try {
        const analysis = await AnalysisHistory.findOne({ fileId: req.params.fileId, userId: req.user.id });
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
router.post('/summarize/:fileId', auth, async (req, res) => {
    try {
        const analysis = await AnalysisHistory.findOne({ fileId: req.params.fileId, userId: req.user.id });
        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        const filePath = path.join(__dirname, '..', 'uploads', analysis.fileId);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        // In a real application, you would send the data to an AI API (e.g., OpenAI, Cohere)
        // and get a summary back. For this example, we'll simulate it.
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Simple mock summary based on data for demonstration
        const mockSummary = `This is a simulated AI summary for the file '${analysis.fileName}'. It contains ${data.length} rows of data. The analysis focused on ${analysis.xAxis} vs ${analysis.yAxis} using a ${analysis.chartType} chart.`;

        // Update the analysis history with the summary
        analysis.summary = mockSummary;
        await analysis.save();

        res.json({ summary: mockSummary });

    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({ message: 'Error generating summary' });
    }
});

module.exports = router; 