const express = require('express');
const router = express.Router();
const { protect, authorizeApplicant } = require('../middleware/authMiddleware');

const {
    sequelize, User, Applicant, TaskApplication, Task, Education,
    WorkExperience, Certification, Preference, CompanyInformation, Attachment,
    JobCategory, Location
} = require('../models');


// @route   GET /api/profile/form
// @desc    Get all existing profile data to populate the edit form
// @access  Private (Applicant only)
router.get('/form', protect, authorizeApplicant, async (req, res) => {
    try {
        const applicantId = req.user.UserID;

        // --- THIS QUERY IS NOW CORRECTED ---
        const profile = await Applicant.findOne({
            where: { Applicant_ID: applicantId },
            include: [
                { model: User, as: 'UserAccountDetails', attributes: ['Email'] },
                { model: Education, as: 'Educations' },
                {
                    model: WorkExperience,
                    as: 'WorkExperiences',
                    include: [{ model: CompanyInformation, as: 'CompanyDetails' }]
                },
                { model: Certification, as: 'Certifications' },
                // Preference (for salary) is a direct association
                { model: Preference, as: 'Preferences' },
                // JobCategories and Locations are also direct associations with Applicant
                {
                    model: JobCategory,
                    as: 'JobCategories',
                    through: { attributes: [] } // This hides the join table attributes from the result
                },
                {
                    model: Location,
                    as: 'Locations',
                    through: { attributes: [] }
                }
            ]
        });

        if (!profile) {
            const user = await User.findByPk(applicantId, { attributes: ['Email'] });
            return res.status(200).json({
                Applicant_ID: applicantId,
                UserAccountDetails: { Email: user.Email },
                Educations: [],
                WorkExperiences: [],
                Certifications: [],
                Preferences: null,
                JobCategories: [],
                Locations: []
            });
        }

        res.status(200).json(profile);

    } catch (error) {
        console.error('Get Profile Form Data Error:', error);
        res.status(500).json({ message: 'Server error while fetching profile data.', error: error.message });
    }
});


// @route   POST /api/profile/form
// @desc    Create or Update an applicant's entire profile from the multi-step form
// @access  Private (Applicant only)
router.post('/form', protect, authorizeApplicant, async (req, res) => {
    const applicantId = req.user.UserID;
    const {
        personalInfo, education, workExperiences, certifications, preferences, deletedIds
    } = req.body;

    try {
        await sequelize.transaction(async (t) => {
            if (personalInfo) {
                await Applicant.update(personalInfo, { where: { Applicant_ID: applicantId }, transaction: t });
            }
            if (deletedIds) {
                if (deletedIds.education?.length > 0) await Education.destroy({ where: { EducationEntryID: deletedIds.education, Applicant_ID: applicantId }, transaction: t });
                if (deletedIds.workExperience?.length > 0) await WorkExperience.destroy({ where: { WorkExperienceID: deletedIds.workExperience, Applicant_ID: applicantId }, transaction: t });
                if (deletedIds.certifications?.length > 0) await Certification.destroy({ where: { CertificationEntryID: deletedIds.certifications, Applicant_ID: applicantId }, transaction: t });
            }
            if (education?.length > 0) {
                await Promise.all(education.map(edu => Education.upsert({ ...edu, Applicant_ID: applicantId }, { transaction: t })));
            }
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
            if (certifications?.length > 0) {
                await Promise.all(certifications.map(cert => Certification.upsert({ ...cert, Applicant_ID: applicantId }, { transaction: t })));
            }
            if (preferences) {
                await Preference.upsert({ Applicant_ID: applicantId, Exp_Salary_Min: preferences.Exp_Salary_Min, Exp_Salary_Max: preferences.Exp_Salary_Max }, { transaction: t });
                
                // Note: The frontend might be sending a string of categories/locations. The backend should handle an array.
                // Assuming frontend sends an array like ["Web Development", "Graphic Design"]
                if (preferences.jobCategories && Array.isArray(preferences.jobCategories)) {
                    await sequelize.models.Applicant_JobCategory_Preferences.destroy({ where: { ApplicantID: applicantId }, transaction: t });
                    await Promise.all(preferences.jobCategories.map(async (catName) => {
                        const [category] = await JobCategory.findOrCreate({ where: { CategoryName: catName }, transaction: t });
                        return sequelize.models.Applicant_JobCategory_Preferences.create({ ApplicantID: applicantId, CategoryID: category.CategoryID }, { transaction: t });
                    }));
                }
                if (preferences.preferredLocations && Array.isArray(preferences.preferredLocations)) {
                    await sequelize.models.Applicant_Location_Preferences.destroy({ where: { ApplicantID: applicantId }, transaction: t });
                    await Promise.all(preferences.preferredLocations.map(async (locName) => {
                        const [location] = await Location.findOrCreate({ where: { LocationName: locName }, transaction: t });
                        return sequelize.models.Applicant_Location_Preferences.create({ ApplicantID: applicantId, LocationID: location.LocationID }, { transaction: t });
                    }));
                }
            }
        });
        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ message: 'An error occurred while updating the profile.', error: error.message });
    }
});


// Other routes are unchanged
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
                { model: Attachment, as: 'Attachments' }
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