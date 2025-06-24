const asyncHandler = require('express-async-handler');
const FileData = require('../models/FileData');
const _ = require('lodash');

// @desc    Clean and process data from a file
// @route   POST /api/process/clean/:fileId
// @access  Private
const cleanData = asyncHandler(async (req, res) => {
    const { action, options } = req.body;
    const { fileId } = req.params;
    const userId = req.user._id;

    // Fetch the original file data
    const originalFile = await FileData.findOne({ _id: fileId, user: userId });
    if (!originalFile) {
        res.status(404);
        throw new Error('Original file not found.');
    }

    let data = _.cloneDeep(originalFile.data); // Work with a deep copy
    let cleanedFileName = `${originalFile.fileName.replace(/\.xlsx$/i, '')}_cleaned.xlsx`;

    switch (action) {
        case 'remove_duplicates':
            data = _.uniqWith(data, _.isEqual);
            break;

        case 'remove_missing_rows':
            if (!options || !options.column) {
                res.status(400);
                throw new Error('Column must be specified for removing missing rows.');
            }
            data = data.filter(row => row[options.column] !== null && row[options.column] !== undefined && row[options.column] !== '');
            break;

        case 'fill_missing_values':
            if (!options || !options.column || options.value === undefined) {
                res.status(400);
                throw new Error('Column and fill value must be specified.');
            }
            data.forEach(row => {
                if (row[options.column] === null || row[options.column] === undefined || row[options.column] === '') {
                    row[options.column] = options.value;
                }
            });
            break;
            
        default:
            res.status(400);
            throw new Error(`Invalid cleaning action: ${action}`);
    }
    
    // Check if data has changed
    if (_.isEqual(data, originalFile.data)) {
        res.status(200).json({ message: 'No changes were made to the data.', noChange: true });
        return;
    }

    // Save the cleaned data as a new file
    const cleanedFile = new FileData({
        user: userId,
        fileName: cleanedFileName,
        data: data,
    });

    const savedFile = await cleanedFile.save();

    res.status(201).json({
        message: 'Data cleaned successfully and saved as a new file.',
        file: savedFile
    });
});

module.exports = {
    cleanData,
}; 