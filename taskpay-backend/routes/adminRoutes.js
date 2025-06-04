const express = require('express');
const router = express.Router();
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// Import models from the central db object
const {
    User,
    Applicant,
    Education,
    WorkExperience,
    Certification,
    Preference,
    CompanyInformation
    // Task, TaskApplication, Attachment // For future admin features
} = require('../models');

// @route   GET /api/admin/applicants
// @desc    Get a list of all applicants with their profile information
// @access  Private (Admin only)
router.get('/applicants', protect, authorizeAdmin, async (req, res) => {
    try {
        // Find all users who have the 'applicant' role.
        // This query is more complex now with the UserRoles table.
        const applicants = await User.findAll({
            attributes: ['UserID', 'Email', 'createdAt', 'updatedAt'], // Select specific User fields
            include: [
                {
                    model: Applicant,
                    as: 'ApplicantProfile', // Alias from User model's association
                    required: true, // Ensures we only get Users that HAVE an ApplicantProfile
                    include: [ // Nested includes for Applicant's details
                        { model: Education, as: 'Educations' },
                        {
                            model: WorkExperience,
                            as: 'WorkExperiences',
                            include: [{ model: CompanyInformation, as: 'CompanyDetails' }] // Ensure 'CompanyDetails' alias matches
                        },
                        { model: Certification, as: 'Certifications' },
                        { model: Preference, as: 'Preferences' },
                    ]
                },
                {
                    model: db.Role, // Access Role via db from models/index.js
                    as: 'Roles',    // Alias from User model's association
                    where: { RoleName: 'applicant' }, // Filter by role name
                    attributes: [] // Don't need to return Role details in this context, just use for filtering
                }
            ],
            // The where clause on the include for Roles will effectively filter Users
            // You might need to adjust if a user can be an applicant AND something else
            // and you strictly want users whose *only* or *primary* role is applicant.
            // For now, this gets users who *have* the applicant role.
            order: [['createdAt', 'DESC']]
        });


        if (!applicants || applicants.length === 0) {
            return res.status(404).json({ message: 'No applicants found.' });
        }
        res.status(200).json(applicants);

    } catch (error) {
        console.error('Admin Get Applicants Error:', error);
        res.status(500).json({ message: 'Server error while fetching applicants.', error: error.message });
    }
});

// Placeholder for db to access Role model in include if not destructured directly
const db = require('../models');

module.exports = router;
