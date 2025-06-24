const express = require('express');
const router = express.Router();
const Insight = require('../models/Insight');
const { protect } = require('../middleware/authMiddleware');

// Get all insights for the logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const insights = await Insight.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching insights' });
    }
});

// Get a single insight by id
router.get('/:id', protect, async (req, res) => {
    try {
        const insight = await Insight.findOne({ _id: req.params.id, userId: req.user._id });
        if (!insight) return res.status(404).json({ message: 'Insight not found' });
        res.json(insight);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching insight' });
    }
});

// Create a new insight
router.post('/', protect, async (req, res) => {
    try {
        const { analysisId, title, content } = req.body;
        if (!analysisId || !title || !content) {
            return res.status(400).json({ message: 'analysisId, title, and content are required' });
        }
        const newInsight = new Insight({
            userId: req.user._id,
            analysisId,
            title,
            content
        });
        const savedInsight = await newInsight.save();
        res.status(201).json(savedInsight);
    } catch (error) {
        res.status(500).json({ message: 'Error creating insight' });
    }
});

// Update an insight
router.put('/:id', protect, async (req, res) => {
    try {
        const { title, content } = req.body;
        const insight = await Insight.findOne({ _id: req.params.id, userId: req.user._id });
        if (!insight) return res.status(404).json({ message: 'Insight not found' });
        if (title) insight.title = title;
        if (content) insight.content = content;
        insight.updatedAt = Date.now();
        const updatedInsight = await insight.save();
        res.json(updatedInsight);
    } catch (error) {
        res.status(500).json({ message: 'Error updating insight' });
    }
});

// Delete an insight
router.delete('/:id', protect, async (req, res) => {
    try {
        const insight = await Insight.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!insight) return res.status(404).json({ message: 'Insight not found' });
        res.json({ message: 'Insight deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting insight' });
    }
});

module.exports = router; 