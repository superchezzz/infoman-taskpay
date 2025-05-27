const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database'); // For transactions if needed
const { protect } = require('../middleware/authMiddleware'); // To protect routes

// Import all necessary models
const User = require('../models/User');
const Applicant = require('../models/Applicant');
const Education = require('../models/Education');
const WorkExperience = require('../models/WorkExperience');
const Certification = require('../models/Certification');
const Preference = require('../models/Preference');
// const Attachment = require('../models/Attachment'); // Uncomment when you implement file uploads
// const CompanyInformation = require('../models/CompanyInformation'); // If needed for creating new companies during work exp. submission

// --- Helper function to get or create CompanyInformation ---
// (You might move this to a service or controller later)
const getOrCreateCompany = async (companyName, companyAddress) => {
    if (!companyName) return null;
    let company = await CompanyInformation.findOne({ where: { Cmp_Name: companyName } });
    if (!company) {
        company = await CompanyInformation.create({ Cmp_Name: companyName, Cmp_Address: companyAddress });
    }
    return company;
};


// @route   POST /api/profile/form
// @desc    Submit or Update applicant's employment information form [cite: 1]
// @access  Private (Applicant only)
router.post('/form', protect, async (req, res) => {
    // The user ID is available from the 'protect' middleware via req.user.UserID
    const applicantId = req.user.UserID;

    const {
        // Applicant personal details (already partially created during registration)
        Surname, First_Name, Middle_Name, Suffix, Age, Sex, Civil_Status,
        DOB, Place_of_Birth, House_No, Street, Brgy, City, Province,
        TIN_No, SSS_No, Philhealth_No, Landline, Phone_Num, Disability, Emp_Status,

        // Education entries (array of objects)
        education, // e.g., [{ Educ_Level, School, Course, Awards, Yr_Grad }, ...]

        // Work Experience entries (array of objects)
        workExperiences, // e.g., [{ Cmp_Name, Cmp_Address, inclusive_date_from, inclusive_date_to, Position, Status }, ...]

        // Certification entries (array of objects)
        certifications, // e.g., [{ Certifications, course_date_from, course_date_to, Issuing_Organization, Certification_Level, Training_Duration }, ...]

        // Preference entries (array of objects)
        preferences // e.g., [{ Pref_Occupation, Pref_Location, Exp_Salary }, ...]
    } = req.body;

    const t = await sequelize.transaction(); // Start a transaction

    try {
        // --- 1. Update Applicant's Personal Details ---
        // Ensure the applicant record exists (it should have been created during registration)
        let applicant = await Applicant.findByPk(applicantId, { transaction: t });
        if (!applicant) {
            // This case should ideally not happen if registration creates an applicant stub
            await t.rollback();
            return res.status(404).json({ message: "Applicant profile not found. Please ensure registration was complete." });
        }

        await applicant.update({
            Surname: Surname || applicant.Surname, // Use existing if not provided
            First_Name: First_Name || applicant.First_Name,
            Middle_Name, Suffix, Age, Sex, Civil_Status, DOB, Place_of_Birth,
            House_No, Street, Brgy, City, Province, TIN_No, SSS_No,
            Philhealth_No, Landline, Phone_Num, Disability, Emp_Status
        }, { transaction: t });

        // --- 2. Handle Education Entries (Create or Update) ---
        // For simplicity, this example will delete existing and recreate.
        // A more sophisticated approach would involve finding existing records and updating/deleting/adding.
        await Education.destroy({ where: { Applicant_ID: applicantId }, transaction: t });
        if (education && education.length > 0) {
            const educationData = education.map(edu => ({ ...edu, Applicant_ID: applicantId }));
            await Education.bulkCreate(educationData, { transaction: t, validate: true });
        }

        // --- 3. Handle Work Experience Entries ---
        await WorkExperience.destroy({ where: { Applicant_ID: applicantId }, transaction: t });
        if (workExperiences && workExperiences.length > 0) {
            const workExperienceData = [];
            for (const work of workExperiences) {
                let companyInfoId = null;
                if (work.Cmp_Name) { // Assuming Cmp_Name is how you identify a company from COMPANY_INFORMATION
                    const company = await getOrCreateCompany(work.Cmp_Name, work.Cmp_Address); // Helper to find or create company
                    companyInfoId = company ? company.CompanyInfo_ID : null;
                }
                workExperienceData.push({
                    ...work,
                    Applicant_ID: applicantId,
                    CompanyInfo_ID: companyInfoId,
                    Cmp_Name_Manual: companyInfoId ? null : work.Cmp_Name, // Store manually if not linked
                    Cmp_Address_Manual: companyInfoId ? null : work.Cmp_Address
                });
            }
            await WorkExperience.bulkCreate(workExperienceData, { transaction: t, validate: true });
        }

        // --- 4. Handle Certification Entries ---
        await Certification.destroy({ where: { Applicant_ID: applicantId }, transaction: t });
        if (certifications && certifications.length > 0) {
            const certificationData = certifications.map(cert => ({ ...cert, Applicant_ID: applicantId }));
            await Certification.bulkCreate(certificationData, { transaction: t, validate: true });
        }

        // --- 5. Handle Preference Entries ---
        await Preference.destroy({ where: { Applicant_ID: applicantId }, transaction: t });
        if (preferences && preferences.length > 0) {
            const preferenceData = preferences.map(pref => ({ ...pref, Applicant_ID: applicantId }));
            await Preference.bulkCreate(preferenceData, { transaction: t, validate: true });
        }

        // If everything is fine, commit the transaction
        await t.commit();
        res.status(200).json({ message: "Applicant form submitted/updated successfully." });

    } catch (error) {
        await t.rollback(); // Rollback transaction on error
        console.error("Form Submission Error:", error);
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ message: 'Validation Error during form submission.', errors: messages });
        }
        res.status(500).json({ message: "Server error during form submission.", error: error.message });
    }
});


// @route   GET /api/profile/form
// @desc    Get logged-in applicant's completed form data [cite: 1]
// @access  Private (Applicant only)
router.get('/form', protect, async (req, res) => {
    const applicantId = req.user.UserID;

    try {
        const applicantForm = await Applicant.findOne({
            where: { Applicant_ID: applicantId },
            include: [ // Eager load all associated data
                { model: Education, as: 'Educations' }, // 'as' should match alias in association if defined
                { model: WorkExperience, as: 'WorkExperiences', include: [{model: CompanyInformation, as: 'CompanyInformation'}] },
                { model: Certification, as: 'Certifications' },
                { model: Preference, as: 'Preferences' },
                // { model: Attachment, as: 'Attachments' } // Uncomment when ready
            ]
        });

        if (!applicantForm) {
            return res.status(404).json({ message: "Applicant form data not found." });
        }

        res.status(200).json(applicantForm);

    } catch (error) {
        console.error("Get Form Error:", error);
        res.status(500).json({ message: "Server error while retrieving form data.", error: error.message });
    }
});


module.exports = router;