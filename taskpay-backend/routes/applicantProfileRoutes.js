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
    Attachment,
    TaskApplication,
    Task,
    Sequelize // Import Sequelize for Op.in
} = require('../models');

const { protect } = require('../middleware/authMiddleware');
const { Op } = Sequelize; // Define Op for use in queries

// --- Helper function to get or create CompanyInformation ---
// Now accepts and uses the transaction object
const getOrCreateCompany = async (companyName, companyAddress, transaction = null) => {
    if (!companyName) return null;
    let company = await CompanyInformation.findOne({ where: { Cmp_Name: companyName }, transaction });
    if (!company) {
        company = await CompanyInformation.create({ Cmp_Name: companyName, Cmp_Address: companyAddress }, { transaction });
    }
    return company;
};

// Add a helper function to safely update or create nested array items
// This function will iterate through items and either update existing ones by ID
// or create new ones if they don't have an ID.
const updateOrCreateNestedItems = async (
    Model,
    applicantId,
    incomingItems, // This is the 'items' array from the frontend payload
    deletedIds,    // This is the 'deletedIds' array from the frontend payload
    transaction,
    itemProcessor = (item) => item // Optional function to process/map item before create/update
) => {
    // 1. Delete items marked for deletion
    if (deletedIds && deletedIds.length > 0) {
        const primaryKeyAttribute = Object.keys(Model.rawAttributes)[0]; // Get the actual primary key attribute name
        await Model.destroy({
            where: {
                [primaryKeyAttribute]: { [Op.in]: deletedIds }, // Use the actual primary key with Op.in
                Applicant_ID: applicantId
            },
            transaction
        });
    }

    // 2. Process incoming items (create new or update existing)
    for (const item of incomingItems) {
        let processedItem = { ...itemProcessor(item), Applicant_ID: applicantId };
        const primaryKeyAttribute = Object.keys(Model.rawAttributes)[0];

        if (processedItem[primaryKeyAttribute]) { // If item has an ID, it's an update
            await Model.update(processedItem, {
                where: {
                    [primaryKeyAttribute]: processedItem[primaryKeyAttribute],
                    Applicant_ID: applicantId
                },
                transaction,
                validate: true // Ensure validations run on update
            });
        } else { // If item has no ID, it's a new creation
            // Remove any potential empty ID field (e.g., from frontend if not provided)
            delete processedItem[primaryKeyAttribute];
            await Model.create(processedItem, { transaction, validate: true });
        }
    }
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
        // New granular payload structure from frontend
        education,       // { items: [], deletedIds: [] }
        workExperiences, // { items: [], deletedIds: [] }
        certifications,  // { items: [], deletedIds: [] }
        preferences      // Single object (not an array)
    } = req.body;

    const t = await sequelize.transaction(); // Start a transaction

    try {
        let applicant = await Applicant.findByPk(applicantId, { transaction: t });
        if (!applicant) {
            await t.rollback();
            return res.status(404).json({ message: "Applicant profile not found." });
        }

        // --- 1. Update Applicant's Top-Level Information ---
        await applicant.update({
            Surname: Surname || applicant.Surname, First_Name: First_Name || applicant.First_Name,
            Middle_Name, Suffix, Age, Sex, Civil_Status, DOB, Place_of_Birth,
            House_No, Street, Brgy, City, Province, TIN_No, SSS_No,
            Philhealth_No, Landline, Phone_Num, Disability, Emp_Status
        }, { transaction: t });


        // --- 2. Update Education Entries ---
        await updateOrCreateNestedItems(
            Education,
            applicantId,
            education.items,
            education.deletedIds,
            t,
            // Processor function to map frontend fields to backend model fields
            (edu) => ({
                Educ_Level: edu.Educ_Level, // Frontend Educational_Attainment -> Backend Educ_Level
                School: edu.School,
                Course: edu.Course,
                Awards: edu.Awards,
                Yr_Grad: edu.Yr_Grad, // Frontend Graduation_Year -> Backend Yr_Grad
                ...(edu.EducationEntryID && { EducationEntryID: edu.EducationEntryID }) // Include ID if it exists
            })
        );


        // --- 3. Update Work Experience Entries ---
        await updateOrCreateNestedItems(
            WorkExperience,
            applicantId,
            workExperiences.items,
            workExperiences.deletedIds,
            t,
            async (work) => { // Use async processor for getOrCreateCompany
                let companyInfoId = null;
                if (work.Cmp_Name) { // Frontend 'Cmp_Name' is used to find/create company
                    const company = await getOrCreateCompany(work.Cmp_Name, work.Cmp_Address, t);
                    companyInfoId = company ? company.CompanyInfo_ID : null;
                }
                return {
                    Position: work.Position,
                    Status: work.Status,
                    Responsibilities: work.Responsibilities || null, // Ensure Responsibilities is mapped
                    inclusive_date_from: work.inclusive_date_from, // Frontend Start_Date -> Backend inclusive_date_from
                    inclusive_date_to: work.inclusive_date_to,     // Frontend End_Date -> Backend inclusive_date_to
                    CompanyInfo_ID: companyInfoId,
                    Cmp_Name_Manual: companyInfoId ? null : work.Cmp_Name,
                    Cmp_Address_Manual: companyInfoId ? null : work.Cmp_Address,
                    ...(work.WorkExperienceID && { WorkExperienceID: work.WorkExperienceID }) // Include ID if it exists
                };
            }
        );


        // --- 4. Update Certification Entries ---
        await updateOrCreateNestedItems(
            Certification,
            applicantId,
            certifications.items,
            certifications.deletedIds,
            t,
            (cert) => ({
                Certifications: cert.Certifications, // Frontend Certification_Name -> Backend Certifications
                Issuing_Organization: cert.Issuing_Organization,
                course_date_from: cert.course_date_from, // Frontend Start_Date -> Backend course_date_from
                course_date_to: cert.course_date_to,     // Frontend End_Date -> Backend course_date_to
                Training_Duration: cert.Training_Duration,
                ...(cert.CertificationEntryID && { CertificationEntryID: cert.CertificationEntryID }) // Include ID if it exists
            })
        );


        // --- 5. Update Preferences (single object per applicant) ---
        // Find existing preference, or create if none exists.
        // If frontend sends data, update/create. If no data and entry exists, delete.
        let preferenceEntry = await Preference.findOne({ where: { Applicant_ID: applicantId }, transaction: t });

        if (preferences) { // If frontend sent preference data (i.e., not null/undefined)
            const preferenceData = {
                Pref_Occupation: preferences.Pref_Occupation || null, // Frontend Pref_Job_Categories -> Backend Pref_Occupation
                Pref_Location: preferences.Pref_Location || null,     // Frontend Pref_Locations -> Backend Pref_Location
                Exp_Salary_Min: preferences.Exp_Salary_Min || null,
                Exp_Salary_Max: preferences.Exp_Salary_Max || null
            };

            if (preferenceEntry) {
                // Update existing preference
                await preferenceEntry.update(preferenceData, { transaction: t, validate: true });
            } else {
                // Create new preference
                await Preference.create({ ...preferenceData, Applicant_ID: applicantId }, { transaction: t, validate: true });
            }
        } else if (preferenceEntry) { // If no preferences sent from frontend but one exists, delete it
            await preferenceEntry.destroy({ transaction: t });
        }


        await t.commit(); // Commit the transaction if all operations succeed
        res.status(200).json({ message: "Applicant profile updated successfully." });

    } catch (error) {
        await t.rollback(); // Rollback if any operation fails
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
    // ADD THIS console.log BACK to confirm it's being hit now
    console.log('Backend: GET /api/profile/form hit!'); 

    const applicantId = req.user.UserID;
    try {
        const applicantForm = await Applicant.findOne({
            where: { Applicant_ID: applicantId },
            include: [
                { model: User, as: 'UserAccountDetails', attributes: ['Email'] },
                { model: Education, as: 'Educations' },
                {
                    model: WorkExperience,
                    as: 'WorkExperiences',
                    // Explicitly select all columns from WORK_EXPERIENCE
                    attributes: [
                        'WorkExperienceID', // Your actual primary key
                        'Position',
                        'Status',
                        'Responsibilities', // Ensure this is included
                        'inclusive_date_from', // Include dates
                        'inclusive_date_to',   // Include dates
                        'CompanyInfo_ID',      // Needed for CompanyDetails association
                        'Cmp_Name_Manual',     // Include manual company details
                        'Cmp_Address_Manual'   // Include manual company details
                    ],
                    include: [{ model: CompanyInformation, as: 'CompanyDetails' }]
                },
                { model: Certification, as: 'Certifications' },
                {
                    model: Preference,
                    as: 'Preferences',
                    // Explicitly select all columns from PREFERENCE, including new salary fields
                    attributes: [
                        'PreferenceEntryID',
                        'Pref_Occupation',
                        'Pref_Location',
                        'Exp_Salary_Min',
                        'Exp_Salary_Max'
                    ]
                },
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

// @route   PUT /api/profile/documents
// @desc    Update applicant's document numbers (TIN, SSS, etc.)
// @access  Private (Applicant only)
router.put('/documents', protect, async (req, res) => {
    const applicantId = req.user.UserID;

    // We expect the frontend to send an object with these keys
    const { tinNumber, sssNumber, philhealthNumber } = req.body;

    try {
        // Find the applicant profile for the logged-in user
        const applicant = await Applicant.findByPk(applicantId);

        if (!applicant) {
            return res.status(404).json({ message: "Applicant profile not found." });
        }

        // Update the applicant's record with the new document numbers.
        // The backend field names (e.g., TIN_No) are mapped from the
        // frontend field names (e.g., tinNumber).
        applicant.TIN_No = tinNumber;
        applicant.SSS_No = sssNumber;
        applicant.Philhealth_No = philhealthNumber;

        // Save the updated record to the database
        await applicant.save();

        res.status(200).json({
            message: 'Documents updated successfully.',
            // Send back the updated applicant data if needed
            applicant: {
                TIN_No: applicant.TIN_No,
                SSS_No: applicant.SSS_No,
                Philhealth_No: applicant.Philhealth_No
            }
        });

    } catch (error) {
        console.error("Update Documents Error:", error);
        res.status(500).json({ message: "Server error while updating documents." });
    }
});

// @route   GET /api/profile/documents
// @desc    Get an applicant's document numbers
// @access  Private (Applicant only)
router.get('/documents', protect, async (req, res) => {
    const applicantId = req.user.UserID;

    try {
        const applicant = await Applicant.findByPk(applicantId, {
            // Select only the specific fields we need
            attributes: ['TIN_No', 'SSS_No', 'Philhealth_No']
        });

        if (!applicant) {
            return res.status(404).json({ message: "Applicant profile not found." });
        }
        
        // Map backend names (TIN_No) to frontend names (tinNumber) for consistency
        const documents = {
            tinNumber: applicant.TIN_No,
            sssNumber: applicant.SSS_No,
            philhealthNumber: applicant.Philhealth_No
        };

        res.status(200).json(documents);

    } catch (error) {
        console.error("Get Documents Error:", error);
        res.status(500).json({ message: "Server error while fetching documents." });
    }
});

// @route   GET /api/profile/dashboard
// @desc    Get all data needed for the applicant dashboard view
// @access  Private (Applicant only)
router.get('/dashboard', protect, async (req, res) => {
    const applicantId = req.user.UserID;

    try {
        const applicantProfile = await Applicant.findOne({
            where: { Applicant_ID: applicantId },
            include: [{
                model: User,
                as: 'UserAccountDetails',
                attributes: ['Email']
            }]
        });

        // --- NEW DEBUGGING LOG ---
        // This will print the raw data from the database to your terminal.
        console.log('--- Raw Profile Data from DB for Dashboard ---');
        console.log(applicantProfile?.get({ plain: true }));
        console.log('-------------------------------------------');


        if (!applicantProfile) {
            return res.status(404).json({ message: "Applicant profile not found." });
        }

        const taskApplications = await TaskApplication.findAll({
            where: { Applicant_ID: applicantId },
            include: [{
                model: Task,
                as: 'TaskDetails',
                attributes: ['Title', 'Budget', 'ClientName', 'Category', 'Description', 'Deadline', 'PostedDate', 'Duration']
            }],
            order: [['ApplicationDate', 'DESC']]
        });
        
        // --- CORRECTED FORMATTING ---
        // We will now create the object with the exact keys the frontend needs.
        const formattedProfile = {
            Applicant_ID: applicantProfile.Applicant_ID,
            First_Name: applicantProfile.First_Name,
            Surname: applicantProfile.Surname,
            Sex: applicantProfile.Sex,
            // FIX: Changed from "Civil_Status" to "CivilStatus" to match the likely frontend expectation
            CivilStatus: applicantProfile.Civil_Status,
            DoB: applicantProfile.DOB,
            Email: applicantProfile.UserAccountDetails?.Email || '',
            Address: [
                applicantProfile.House_No,
                applicantProfile.Street,
                applicantProfile.Brgy,
                applicantProfile.City,
                applicantProfile.Province
            ].filter(Boolean).join(', ')
        };
        
        const dashboardData = {
            profile: formattedProfile,
            applications: taskApplications || []
        };
        
        res.status(200).json(dashboardData);

    } catch (error) {
        console.error("Dashboard Data Error:", error);
        res.status(500).json({ message: "Server error while fetching dashboard data.", error: error.message });
    }
});

module.exports = router;