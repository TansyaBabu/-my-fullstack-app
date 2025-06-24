const mongoose = require('mongoose');

const FileDataSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        fileName: {
            type: String,
            required: true,
        },
        data: {
            type: Array,
            required: true,
        },
        rowCount: {
            type: Number,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Add an index on the 'user' field for faster querying of files by user
FileDataSchema.index({ user: 1 });

module.exports = mongoose.model('FileData', FileDataSchema); 