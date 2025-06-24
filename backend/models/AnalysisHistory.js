const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileId: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true
    },
    chartType: {
        type: String,
        required: true
    },
    xAxis: {
        type: String,
        required: true
    },
    yAxis: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        default: ''
    },
    analysisDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create a compound index to ensure one analysis per user per file
analysisHistorySchema.index({ userId: 1, fileId: 1 }, { unique: true });

const AnalysisHistory = mongoose.model('AnalysisHistory', analysisHistorySchema);
console.log('AnalysisHistory model loaded:', !!AnalysisHistory);
console.log('AnalysisHistory model name:', AnalysisHistory.modelName);

module.exports = AnalysisHistory;
