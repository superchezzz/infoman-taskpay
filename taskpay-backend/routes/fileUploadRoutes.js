/**
 * @file fileUploadRoutes.js
 * @description Defines API routes for file upload functionalities.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadResume, handleUploadErrors } = require('../middleware/uploadMiddleware');
const { Attachment } = require('../models'); // Import the Attachment model
const fs = require('fs'); // Node.js File System module for deleting old files

// @route   POST /api/uploads/resume
// @desc    Upload or replace an applicant's resume
// @access  Private (Applicant only)
router.post('/resume', protect, (req, res) => {
    // The 'uploadResume' middleware runs first. If there's an issue with the file itself
    // (like size or type), it will throw an error before this handler is even reached.
    // We then pass it to our custom error handler.
    uploadResume(req, res, async (err) => {
        // Pass any upload-specific errors to our error handler middleware
        if (err) {
            return handleUploadErrors(err, req, res);
        }

        // Check if a file was actually uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No resume file was uploaded.' });
        }
        
        const applicantId = req.user.UserID;

        try {
            // Logic to handle previous resume: Find and delete the old one.
            const existingAttachment = await Attachment.findOne({ where: { Applicant_ID: applicantId } });
            if (existingAttachment) {
                // Delete the old file from the server's file system
                // Use fs.unlink, but handle errors gracefully in case the file doesn't exist.
                if (fs.existsSync(existingAttachment.FilePath)) {
                    fs.unlink(existingAttachment.FilePath, (unlinkErr) => {
                        if (unlinkErr) console.error("Error deleting old file:", unlinkErr);
                    });
                }
                // Delete the old record from the database
                await existingAttachment.destroy();
            }

            // Create a new record in the Attachments table for the uploaded file
            const newAttachment = await Attachment.create({
                Applicant_ID: applicantId,
                FileName: req.file.originalname,
                FilePath: req.file.path, // The full path where multer saved the file
                FileType: req.file.mimetype,
                FileSize: req.file.size
            });

            res.status(201).json({
                message: 'Resume uploaded successfully.',
                attachment: newAttachment
            });

        } catch (dbError) {
            console.error('Error saving attachment record:', dbError);
            res.status(500).json({ message: 'Server error while saving file information.' });
        }
    });
});

module.exports = router;