const mongoose = require('mongoose');

const insightSchema = mongoose.Schema(
    {
        user: {
        type: mongoose.Schema.Types.ObjectId,
            required: true,
        ref: 'User',
    },
        file: {
        type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'FileData',
    },
        insightType: {
        type: String,
        required: true,
            enum: ['Trend', 'Anomaly', 'Prediction', 'Summary'],
    },
    content: {
        type: String,
            required: true,
    },
        generatedAt: {
        type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Insight', insightSchema); 