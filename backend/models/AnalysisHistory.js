const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    fileId: {
        type: String,
        required: true,
        unique: true
    },
    filePath: {
        type: String,
        required: false
    },
    chartType: {
        type: String,
        enum: ['Bar', 'Line', 'Pie', 'Scatter'],
        default: 'Bar'
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
        required: false
    },
    analysisDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add index for faster queries
analysisHistorySchema.index({ analysisDate: -1 });

const AnalysisHistory = mongoose.model('AnalysisHistory', analysisHistorySchema);

module.exports = AnalysisHistory;
