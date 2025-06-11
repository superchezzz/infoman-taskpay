const express = require('express');
const router = express.Router();
const { protect, authorizeApplicant } = require('../middleware/authMiddleware');

const {
    sequelize, User, Applicant, TaskApplication, Task, Education,
    WorkExperience, Certification, Preference, CompanyInformation,
    JobCategory, Location
} = require('../models');

// @route   GET /api/profile/documents
// @desc    Get an applicant's document numbers (TIN, SSS, PhilHealth)
// @access  Private (Applicant only)
router.get('/documents', protect, authorizeApplicant, async (req, res) => {
    try {
        const applicantId = req.user.UserID;

        const applicant = await Applicant.findOne({
            where: { Applicant_ID: applicantId },
            // Fetch only the specific columns needed for this feature for efficiency
            attributes: ['TIN_No', 'SSS_No', 'Philhealth_No']
        });

        if (!applicant) {
            // If for some reason the applicant profile doesn't exist, send back empty strings
            return res.status(404).json({
                tinNumber: '',
                sssNumber: '',
                philhealthNumber: ''
            });
        }

        // Map the database names (e.g., TIN_No) to the frontend-friendly
        // camelCase names (e.g., tinNumber) that the DocumentsForm component expects.
        const formattedDocuments = {
            tinNumber: applicant.TIN_No || '',
            sssNumber: applicant.SSS_No || '',
            philhealthNumber: applicant.Philhealth_No || ''
        };

        res.status(200).json(formattedDocuments);

    } catch (error) {
        console.error('Get Documents Error:', error);
        res.status(500).json({ message: 'Server error while fetching documents.' });
    }
});

// @route   PUT /api/profile/documents
// @desc    Update an applicant's document numbers
// @access  Private (Applicant only)
router.put('/documents', protect, authorizeApplicant, async (req, res) => {
    try {
        const applicantId = req.user.UserID;
        const { tinNumber, sssNumber, philhealthNumber } = req.body;

        // Map the frontend camelCase names to the backend database column names
        const fieldsToUpdate = {
            TIN_No: tinNumber,
            SSS_No: sssNumber,
            Philhealth_No: philhealthNumber
        };

        // Update the Applicant record in the database
        await Applicant.update(fieldsToUpdate, {
            where: { Applicant_ID: applicantId }
        });

        res.status(200).json({ message: 'Documents updated successfully.' });

    } catch (error) {
        console.error('Update Documents Error:', error);
        res.status(500).json({ message: 'Server error while updating documents.' });
    }
});

// GET /api/profile/form (This route is correct and remains unchanged)
router.get('/form', protect, authorizeApplicant, async (req, res) => {
    try {
        const applicantId = req.user.UserID;
        const profile = await Applicant.findOne({
            where: { Applicant_ID: applicantId },
            include: [
                { model: User, as: 'UserAccountDetails', attributes: ['Email'] },
                { model: Education, as: 'Educations' },
                { model: WorkExperience, as: 'WorkExperiences', include: [{ model: CompanyInformation, as: 'CompanyDetails' }] },
                { model: Certification, as: 'Certifications' },
                { model: Preference, as: 'Preferences' },
                { model: JobCategory, as: 'JobCategories', through: { attributes: [] } },
                { model: Location, as: 'Locations', through: { attributes: [] } }
            ]
        });
        if (!profile) {
            const user = await User.findByPk(applicantId, { attributes: ['Email'] });
            return res.status(200).json({
                Applicant_ID: applicantId, UserAccountDetails: { Email: user.Email }, Educations: [],
                WorkExperiences: [], Certifications: [], Preferences: null, JobCategories: [], Locations: []
            });
        }
        res.status(200).json(profile);
    } catch (error) {
        console.error('Get Profile Form Data Error:', error);
        res.status(500).json({ message: 'Server error while fetching profile data.', error: error.message });
    }
});


// @route   POST /api/profile/form
// @desc    Create or Update an applicant's entire profile
// @access  Private (Applicant only)
router.post('/form', protect, authorizeApplicant, async (req, res) => {
    const applicantId = req.user.UserID;
    const { personalInfo, education, workExperiences, certifications, preferences, deletedIds } = req.body;

    try {
        await sequelize.transaction(async (t) => {
            // These sections are fine
            if (personalInfo) await Applicant.update(personalInfo, { where: { Applicant_ID: applicantId }, transaction: t });
            if (deletedIds?.education?.length > 0) await Education.destroy({ where: { EducationEntryID: deletedIds.education, Applicant_ID: applicantId }, transaction: t });
            if (deletedIds?.workExperience?.length > 0) await WorkExperience.destroy({ where: { WorkExperienceID: deletedIds.workExperience, Applicant_ID: applicantId }, transaction: t });
            if (deletedIds?.certifications?.length > 0) await Certification.destroy({ where: { CertificationEntryID: deletedIds.certifications, Applicant_ID: applicantId }, transaction: t });
            if (education?.length > 0) await Promise.all(education.map(edu => Education.upsert({ ...edu, Applicant_ID: applicantId }, { transaction: t })));
            if (certifications?.length > 0) await Promise.all(certifications.map(cert => Certification.upsert({ ...cert, Applicant_ID: applicantId }, { transaction: t })));
            if (workExperiences?.length > 0) {
                await Promise.all(workExperiences.map(async (job) => {
                    let companyInfoId = null;
                    if (job.Cmp_Name) {
                        const [company] = await CompanyInformation.findOrCreate({ where: { Cmp_Name: job.Cmp_Name }, defaults: { Cmp_Name: job.Cmp_Name, Cmp_Address: job.Cmp_Address }, transaction: t });
                        companyInfoId = company.CompanyInfo_ID;
                    }
                    return WorkExperience.upsert({ ...job, Applicant_ID: applicantId, CompanyInfo_ID: companyInfoId }, { transaction: t });
                }));
            }
            
            // --- THIS IS THE FINAL FIX ---
            // This block now contains the correct logic to save to the join tables.
            if (preferences) {
                // First, save the salary info to the main Preference table
                await Preference.upsert({
                    Applicant_ID: applicantId,
                    Exp_Salary_Min: preferences.Exp_Salary_Min,
                    Exp_Salary_Max: preferences.Exp_Salary_Max
                }, { transaction: t });

                // Handle Job Category Preferences
                if (preferences.jobCategoryIds && Array.isArray(preferences.jobCategoryIds)) {
                    // 1. Delete all old preferences for this user
                    await Applicant_JobCategory_Preferences.destroy({ where: { ApplicantID: applicantId }, transaction: t });
                    // 2. Prepare the new preferences to be inserted
                    const categoryPrefs = preferences.jobCategoryIds.map(id => ({ ApplicantID: applicantId, CategoryID: id }));
                    // 3. Insert all the new preferences, if any
                    if (categoryPrefs.length > 0) {
                        await Applicant_JobCategory_Preferences.bulkCreate(categoryPrefs, { transaction: t });
                    }
                }

                // Handle Location Preferences with the same logic
                if (preferences.locationIds && Array.isArray(preferences.locationIds)) {
                    await Applicant_Location_Preferences.destroy({ where: { ApplicantID: applicantId }, transaction: t });
                    const locationPrefs = preferences.locationIds.map(id => ({ ApplicantID: applicantId, LocationID: id }));
                    if (locationPrefs.length > 0) {
                        await Applicant_Location_Preferences.bulkCreate(locationPrefs, { transaction: t });
                    }
                }
            }
        });
        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ message: 'An error occurred while updating the profile.', error: error.message });
    }
});


// Other routes are unchanged but depend on the corrected import above
router.get('/dashboard', protect, authorizeApplicant, async (req, res) => {
    try {
        const applicantId = req.user.UserID;
        const [profileInstance, allApplications] = await Promise.all([
            Applicant.findOne({ where: { Applicant_ID: applicantId }, include: [{ model: User, as: 'UserAccountDetails', attributes: ['Email'] }]}),
            TaskApplication.findAll({ where: { Applicant_ID: applicantId }, include: [{ model: Task, as: 'TaskDetails' }], order: [['updatedAt', 'DESC']]})
        ]);
        if (!profileInstance) { return res.status(404).json({ message: 'Applicant profile not found for this user.' }); }
        const profile = profileInstance.toJSON();
        if (profile.UserAccountDetails) {
            profile.Email = profile.UserAccountDetails.Email;
            delete profile.UserAccountDetails;
        }
        const activeStatuses = ['Pending', 'Approved', 'InProgress', 'Shortlisted', 'SubmittedForReview', 'ViewedByAdmin'];
        const activeApplications = allApplications.filter(app => activeStatuses.includes(app.Status));
        const historicalApplications = allApplications.filter(app => !activeStatuses.includes(app.Status));
        res.status(200).json({ profile, activeApplications, historicalApplications });
    } catch (error) {
        console.error('Get Dashboard Data Error:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard data.', error: error.message });
    }
});

// The /me route is now redundant since /form does the same thing, but we can leave it for now.
router.get('/me', protect, authorizeApplicant, async (req, res) => {
    try {
        const applicantId = req.user.UserID;
        const profile = await Applicant.findOne({
            where: { Applicant_ID: applicantId },
            include: [
                { model: User, as: 'UserAccountDetails', attributes: ['Email'] },
                { model: Education, as: 'Educations' },
                { model: WorkExperience, as: 'WorkExperiences', include: [{ model: CompanyInformation, as: 'CompanyDetails' }] },
                { model: Certification, as: 'Certifications' },
                { model: Preference, as: 'Preferences' },
                // Note: this route doesn't fetch JobCategories/Locations, only /form does.
            ]
        });
        if (!profile) { return res.status(404).json({ message: 'Applicant profile not found for this user.' }); }
        res.status(200).json(profile);
    } catch (error) {
        console.error('Get My Profile Error:', error);
        res.status(500).json({ message: 'Server error while fetching profile.', error: error.message });
    }
});

router.post('/me', protect, authorizeApplicant, async (req, res) => {
    const applicantId = req.user.UserID;
    const {
        Surname, First_Name, Middle_Name, Suffix, Age, Sex, Civil_Status, DOB,
        Place_of_Birth, HouseNum_Street, Brgy, City, Province, TIN_No, SSS_No,
        Philhealth_No, Phone_Num, Disability, Emp_Status,
    } = req.body;
    try {
        let applicant = await Applicant.findByPk(applicantId);
        if (!applicant) {
            applicant = await Applicant.create({ Applicant_ID: applicantId, ...req.body });
        } else {
            await applicant.update({
                Surname, First_Name, Middle_Name, Suffix, Age, Sex, Civil_Status, DOB,
                Place_of_Birth, HouseNum_Street, Brgy, City, Province, TIN_No, SSS_No,
                Philhealth_No, Phone_Num, Disability, Emp_Status
            });
        }
        res.status(200).json({ message: 'Profile updated successfully.', profile: applicant });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error while updating profile.', error: error.message });
    }
});

module.exports = router;