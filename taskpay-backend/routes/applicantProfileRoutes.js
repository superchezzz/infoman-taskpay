const express = require('express');
const router = express.Router();
// Import models and sequelize instance from the central models/index.js
const {
    sequelize, // The Sequelize instance for transactions
    User,
    Applicant,
    Education,
    WorkExperience,
    Certification,
    Preference,
    CompanyInformation,
    Attachment
} = require('../models');

const { protect } = require('../middleware/authMiddleware');

// --- Helper function to get or create CompanyInformation ---
const getOrCreateCompany = async (companyName, companyAddress) => {
    if (!companyName) return null;
    // CompanyInformation is now directly available
    let company = await CompanyInformation.findOne({ where: { Cmp_Name: companyName } });
    if (!company) {
        company = await CompanyInformation.create({ Cmp_Name: companyName, Cmp_Address: companyAddress });
    }
    return company;
};

// @route   POST /api/profile/form
// @desc    Submit or Update applicant's employment information form
// @access  Private (Applicant only)
router.post('/form', protect, async (req, res) => {
    const applicantId = req.user.UserID;
    const {
        Surname, First_Name, Middle_Name, Suffix, Age, Sex, Civil_Status,
        DOB, Place_of_Birth, House_No, Street, Brgy, City, Province,
        TIN_No, SSS_No, Philhealth_No, Landline, Phone_Num, Disability, Emp_Status,
        education, workExperiences, certifications, preferences
    } = req.body;

    const t = await sequelize.transaction();

    try {
        let applicant = await Applicant.findByPk(applicantId, { transaction: t });
        if (!applicant) {
            await t.rollback();
            return res.status(404).json({ message: "Applicant profile not found." });
        }

        await applicant.update({
            Surname: Surname || applicant.Surname, First_Name: First_Name || applicant.First_Name,
            Middle_Name, Suffix, Age, Sex, Civil_Status, DOB, Place_of_Birth,
            House_No, Street, Brgy, City, Province, TIN_No, SSS_No,
            Philhealth_No, Landline, Phone_Num, Disability, Emp_Status
        }, { transaction: t });

        await Education.destroy({ where: { Applicant_ID: applicantId }, transaction: t });
        if (education && education.length > 0) {
            await Education.bulkCreate(education.map(edu => ({ ...edu, Applicant_ID: applicantId })), { transaction: t, validate: true });
        }

        await WorkExperience.destroy({ where: { Applicant_ID: applicantId }, transaction: t });
        if (workExperiences && workExperiences.length > 0) {
            const workExperienceData = await Promise.all(workExperiences.map(async (work) => {
                let companyInfoId = null;
                if (work.Cmp_Name) {
                    const company = await getOrCreateCompany(work.Cmp_Name, work.Cmp_Address); // Transaction might need to be passed to helper
                    companyInfoId = company ? company.CompanyInfo_ID : null;
                }
                return {
                    ...work, Applicant_ID: applicantId, CompanyInfo_ID: companyInfoId,
                    Cmp_Name_Manual: companyInfoId ? null : work.Cmp_Name,
                    Cmp_Address_Manual: companyInfoId ? null : work.Cmp_Address
                };
            }));
            await WorkExperience.bulkCreate(workExperienceData, { transaction: t, validate: true });
        }

        await Certification.destroy({ where: { Applicant_ID: applicantId }, transaction: t });
        if (certifications && certifications.length > 0) {
            await Certification.bulkCreate(certifications.map(cert => ({ ...cert, Applicant_ID: applicantId })), { transaction: t, validate: true });
        }

        await Preference.destroy({ where: { Applicant_ID: applicantId }, transaction: t });
        if (preferences && preferences.length > 0) {
            await Preference.bulkCreate(preferences.map(pref => ({ ...pref, Applicant_ID: applicantId })), { transaction: t, validate: true });
        }

        await t.commit();
        res.status(200).json({ message: "Applicant form submitted/updated successfully." });

    } catch (error) {
        await t.rollback();
        console.error("Form Submission Error:", error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation Error.', errors: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: "Server error during form submission.", error: error.message });
    }
});

// @route   GET /api/profile/form
// @desc    Get logged-in applicant's completed form data
// @access  Private (Applicant only)
router.get('/form', protect, async (req, res) => {
    const applicantId = req.user.UserID;
    try {
        const applicantForm = await Applicant.findOne({
            where: { Applicant_ID: applicantId },
            include: [
                { model: Education, as: 'Educations' },
                { model: WorkExperience, as: 'WorkExperiences', include: [{ model: CompanyInformation, as: 'CompanyDetails' }] }, // Ensure 'CompanyDetails' alias matches WorkExperience model
                { model: Certification, as: 'Certifications' },
                { model: Preference, as: 'Preferences' },
                // { model: Attachment, as: 'Attachments' }
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