// adminRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

const db = require('../models');
const {
    User, Applicant, Education, WorkExperience, Certification, Preference, CompanyInformation
} = require('../models');

// @route   GET /api/admin/applicants
// @desc    Get a list of all applicants with their profile information
// @access  Private (Admin only)
router.get('/applicants', protect, authorizeAdmin, async (req, res) => {
    try {
        const applicants = await User.findAll({
            // REMOVED: createdAt and updatedAt, as timestamps are disabled
            attributes: ['UserID', 'Email'],
            include: [
                {
                    model: Applicant,
                    as: 'ApplicantProfile',
                    required: true,
                    include: [
                        { model: Education, as: 'Educations' },
                        {
                            model: WorkExperience,
                            as: 'WorkExperiences',
                            include: [{ model: CompanyInformation, as: 'CompanyDetails' }]
                        },
                        { model: Certification, as: 'Certifications' },
                        { model: Preference, as: 'Preferences' },
                    ]
                },
                {
                    model: db.Role,
                    as: 'Roles',
                    where: { RoleName: 'applicant' },
                    attributes: []
                }
            ],
            // REMOVED: Ordering by 'createdAt' as it no longer exists
            order: [['UserID', 'DESC']] // Changed to order by UserID instead
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

module.exports = router;