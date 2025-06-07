/**
 * @file uploadMiddleware.js
 * @description Configures the Multer middleware for handling file uploads.
 *
 * @description
 * This file sets up Multer, a Node.js middleware for handling multipart/form-data,
 * which is primarily used for uploading files.
 *
 * We configure:
 * - Disk Storage: To specify the destination directory ('uploads/resumes/') and
 * generate a unique filename for each uploaded resume to prevent naming conflicts.
 * - File Filter: To validate the uploaded file's type, ensuring only specific
 * document formats (PDF, DOC, DOCX) are accepted.
 * - Size Limits: To prevent users from uploading excessively large files.
 */

const multer = require('multer');
const path = require('path');

// 1. Configure Disk Storage for Multer
const storage = multer.diskStorage({
    // Set the destination for uploaded files
    destination: (req, file, cb) => {
        cb(null, 'taskpay-backend/uploads/resumes/'); // The folder where resumes will be stored
    },
    // Generate a unique filename to avoid overwriting files with the same name
    filename: (req, file, cb) => {
        // Filename format: user_<UserID>_<timestamp>.<original_extension>
        const uniqueSuffix = `user_${req.user.UserID}_${Date.now()}`;
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

// 2. Configure File Filter
const fileFilter = (req, file, cb) => {
    // Define allowed file extensions
    const allowedFileTypes = /pdf|doc|docx/;
    // Check the file's extension and MIME type
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (mimetype && extname) {
        // If the file type is allowed, accept the file
        return cb(null, true);
    } else {
        // If the file type is not allowed, reject the file with an error message
        cb(new Error('File upload rejected: Only PDF, DOC, and DOCX files are allowed.'), false);
    }
};

// 3. Initialize Multer with the configurations
const uploadResume = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Set file size limit to 5MB (as mentioned in Figma)
    },
    fileFilter: fileFilter
}).single('resume'); // This expects the file to be sent in a field named 'resume'

// Middleware to handle Multer errors gracefully
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred (e.g., file too large)
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message });
    } else if (err) {
        // An unknown error occurred (e.g., our custom file filter error)
        return res.status(400).json({ message: err.message });
    }
    // Everything went fine, proceed
    next();
};


module.exports = { uploadResume, handleUploadErrors };