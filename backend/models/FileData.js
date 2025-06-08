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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('FileData', FileDataSchema); 