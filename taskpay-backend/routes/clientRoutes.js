const express = require('express');
const router = express.Router();
const { protect, authorizeClient } = require('../middleware/authMiddleware');

const db = require('../models'); // Import the whole db object to access models
const {
    sequelize, User, Applicant, Task, TaskApplication,
    ClientProfile, JobCategory, Location, // NEW: Import necessary models
    Sequelize // Import Sequelize itself for literal queries and operators
} = db; // Destructure from db

const { Op } = Sequelize; // For Sequelize operators like Op.in

// Helper to format dates for consistent output (e.g., 'Jul 17, 2025')
const formatDate = (date) => {
    if (!date) return null;
    // Ensure date is a valid Date object before formatting
    const d = new Date(date);
    if (isNaN(d.getTime())) return null; // Handle invalid date strings
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Protect all client routes with authentication and authorization middleware
router.use(protect);
router.use(authorizeClient); // All routes below this line require client role

// @route   GET /api/client/dashboard-summary
// @desc    Get client dashboard summary (stats, profile)
// @access  Private (Client role)
router.get('/dashboard-summary', async (req, res) => {
    try {
        const clientId = req.user.UserID;

        // 1. Fetch Client Profile from client_profiles table
        // req.user already contains ClientProfile due to authMiddleware.js update
        const clientProfileData = req.user.ClientProfile;
        const clientUserEmail = req.user.Email; // Get email from req.user directly

        if (!clientProfileData) {
            return res.status(404).json({ message: 'Client profile not found for the logged-in user.' });
        }

        // 2. Fetch Tasks posted by this client to calculate stats
        const clientTasks = await Task.findAll({
            where: { ClientID: clientId },
            attributes: ['TaskID', 'TaskStatus'], // Only fetch necessary attributes for stats
            include: [{
                model: TaskApplication,
                as: 'Applications',
                attributes: ['ApplicationID'], // Only count applications, don't need full details here
                required: false // Use LEFT JOIN to include tasks even if no applications
            }],
        });

        // Calculate stats
        let filledTasksCount = 0;
        let openTasksCount = 0;
        let totalApplicationsCount = 0;
        let completedTasksCount = 0;

        clientTasks.forEach(task => {
            if (task.TaskStatus === 'Filled') {
                filledTasksCount++;
            }
            if (task.TaskStatus === 'Open') {
                openTasksCount++;
            }
            if (task.Applications && task.Applications.length > 0) {
                totalApplicationsCount += task.Applications.length;
            }
            if (task.TaskStatus === 'Completed') {
                completedTasksCount++;
            }
        });

        res.status(200).json({
            success: true,
            clientProfile: {
                UserID: clientProfileData.UserID,
                First_Name: clientProfileData.First_Name,
                Surname: clientProfileData.Surname,
                CompanyName: clientProfileData.CompanyName,
                Email: clientUserEmail
            },
            stats: {
                filledTasks: filledTasksCount,
                openTasks: openTasksCount,
                totalApplications: totalApplicationsCount,
                completedTasks: completedTasksCount
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard summary.', error: error.message });
    }
});


// @route   GET /api/client/tasks
// @desc    Get client's task listings (sends ALL tasks for the filter)
// @access  Private (Client role)
router.get('/tasks', async (req, res) => {
    try {
        const clientId = req.user.UserID;
        const { status } = req.query; // e.g., "Open Tasks", "In Progress Tasks"

        let whereClause = { ClientID: clientId };

        if (status === 'Open Tasks') {
            whereClause.TaskStatus = 'Open';
        } else if (status === 'Filled Tasks') {
            whereClause.TaskStatus = 'Filled';
        } else if (status === 'In Progress Tasks') {
            whereClause.TaskStatus = 'In Progress';
        } else if (status === 'Closed Tasks') {
            whereClause.TaskStatus = 'Closed';
        } else {
            // This is the default case for "All Tasks"
            // It includes all statuses that are not 'Completed', 'Paid', or 'Closed'
            whereClause.TaskStatus = { [Op.in]: ['Open', 'Filled', 'In Progress', 'SubmittedForReview'] };
        }

        // We now use `findAll` instead of `findAndCountAll` since we are fetching all records
        const tasks = await Task.findAll({
            where: whereClause,
            order: [['PostedDate', 'DESC']],
            include: [{
                model: TaskApplication,
                as: 'Applications',
                attributes: ['ApplicationID', 'Status', 'Applicant_ID'],
                where: {
                    Status: { [Op.in]: ['Pending', 'Approved', 'Shortlisted', 'InProgress', 'SubmittedForReview'] }
                },
                required: false,
                include: [{
                    model: User,
                    as: 'ApplicantDetails',
                    attributes: ['UserID'],
                    include: [{
                        model: Applicant,
                        as: 'ApplicantProfile',
                        attributes: ['Applicant_ID', 'First_Name', 'Surname'],
                        include: [{
                            model: JobCategory,
                            as: 'JobCategories',
                            through: { attributes: [] },
                            attributes: ['CategoryName']
                        }]
                    }]
                }]
            }],
        });

        // The formatting logic you have is correct
        const formattedTasks = tasks.map(task => {
            let selectedApplicantName = task.SelectedApplicantName || null;
            let selectedApplicantId = task.SelectedApplicantID || null;

            if (!selectedApplicantId && task.Applications && task.Applications.length > 0) {
                 const approvedApp = task.Applications.find(app => app.Status === 'Approved');
                 if (approvedApp && approvedApp.ApplicantDetails && approvedApp.ApplicantDetails.ApplicantProfile) {
                     selectedApplicantId = approvedApp.Applicant_ID;
                     selectedApplicantName = `${approvedApp.ApplicantDetails.ApplicantProfile.First_Name} ${approvedApp.ApplicantDetails.ApplicantProfile.Surname}`;
                 }
            }

            return {
                id: task.TaskID,
                jobTitle: task.Title,
                location: task.Location,
                budget: parseFloat(task.Budget),
                dueDate: formatDate(task.Deadline),
                applicants: task.Applications.map(app => ({
                    id: app.Applicant_ID,
                    name: app.ApplicantDetails?.ApplicantProfile ? `${app.ApplicantDetails.ApplicantProfile.First_Name} ${app.ApplicantDetails.ApplicantProfile.Surname}` : 'N/A',
                    skills: app.ApplicantDetails?.ApplicantProfile?.JobCategories ? app.ApplicantDetails.ApplicantProfile.JobCategories.map(jc => jc.CategoryName) : [],
                })),
                filledDate: formatDate(task.FilledDate),
                description: task.Description,
                status: task.TaskStatus.toLowerCase(),
                selectedApplicantId: selectedApplicantId,
                selectedApplicantName: selectedApplicantName,
            };
        });

        // FIX: The response no longer includes pagination details like totalPages
        res.status(200).json({
            success: true,
            tasks: formattedTasks,
            totalTasks: tasks.length // The total is now just the length of the returned array
        });

    } catch (error) {
        console.error('Error fetching client tasks:', error);
        res.status(500).json({ message: 'Server error while fetching client tasks.', error: error.message });
    }
});

// @route   GET /api/client/completed-tasks
// @desc    Get client's completed task listings
// @access  Private (Client role)
router.get('/completed-tasks', async (req, res) => {
    try {
        const clientId = req.user.UserID;
        const { page = 1, limit = 2 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: tasks } = await Task.findAndCountAll({
            where: {
                ClientID: clientId,
                TaskStatus: { [Op.in]: ['Completed'] }
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['FilledDate', 'DESC'], ['PostedDate', 'DESC']],
            include: [{
                model: User,
                as: 'SelectedApplicantDetails',
                attributes: ['UserID'],
                include: [{
                    model: Applicant,
                    as: 'ApplicantProfile',
                    attributes: ['First_Name', 'Surname'],
                }],
                required: false
            }],
        });

        const formattedCompletedTasks = tasks.map(task => {
            let completedBy = task.SelectedApplicantName || null;
            if (!completedBy && task.SelectedApplicantDetails && task.SelectedApplicantDetails.ApplicantProfile) {
                completedBy = `${task.SelectedApplicantDetails.ApplicantProfile.First_Name} ${task.SelectedApplicantDetails.ApplicantProfile.Surname}`;
            }

            return {
                id: task.TaskID,
                jobTitle: task.Title,
                location: task.Location,
                budget: parseFloat(task.Budget),
                duration: task.Duration,
                completedBy: completedBy,
            };
        });

        res.status(200).json({
            success: true,
            completedTasks: formattedCompletedTasks,
            totalCompletedTasks: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });

    } catch (error) {
        console.error('Error fetching completed client tasks:', error);
        res.status(500).json({ message: 'Server error while fetching completed client tasks.', error: error.message });
    }
});


// @route   POST /api/client/tasks
// @desc    A logged-in client creates a new task
// @access  Private (Client only)
router.post('/tasks', async (req, res) => {
    const { jobTitle, category, budget, description, deadline, location, duration } = req.body;

    // Basic validation
    if (!jobTitle || !description || !budget || !category || !deadline || !location) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        const clientId = req.user.UserID;
        const clientProfile = req.user.ClientProfile; // Access the profile directly from req.user

        if (!clientProfile) {
            return res.status(400).json({ message: 'Client profile not found for the logged-in user.' });
        }

        const clientName = clientProfile.CompanyName || `${clientProfile.First_Name} ${clientProfile.Surname}`; // Use company name, fallback to full name

        const newTask = await Task.create({
            ClientID: clientId,
            ClientName: clientName,
            Title: jobTitle,
            Description: description,
            Budget: parseFloat(budget),
            Category: category,
            Location: location,
            Deadline: new Date(deadline), 
            Duration: duration,
            TaskStatus: 'Open', // Default status for new tasks
            PostedDate: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully!',
            task: {
                id: newTask.TaskID,
                jobTitle: newTask.Title,
                location: newTask.Location,
                budget: parseFloat(newTask.Budget),
                dueDate: formatDate(newTask.Deadline),
                applicants: [], // Newly posted task has no applicants
                filledDate: null,
                description: newTask.Description,
                status: newTask.TaskStatus.toLowerCase(),
                selectedApplicantId: null,
                selectedApplicantName: null,
            }
        });

    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error while creating task.', error: error.message });
    }
});

// @route   PUT /api/client/tasks/:taskId/mark-filled
// @desc    Update task status to 'Filled'
// @access  Private (Client role)
router.put('/tasks/:taskId/mark-filled', async (req, res) => {
    try {
        const { taskId } = req.params;
        const clientId = req.user.UserID;

        const task = await Task.findOne({ where: { TaskID: taskId, ClientID: clientId } });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you are not the owner.' });
        }

        if (task.TaskStatus === 'Filled') {
            return res.status(400).json({ message: 'Task is already marked as filled.' });
        }

        task.TaskStatus = 'Filled';
        task.FilledDate = new Date(); // Set filled date when marked filled
        await task.save();

        // Re-fetch to return comprehensive task data (e.g. for applicants if any)
        const updatedTaskFull = await Task.findByPk(task.TaskID, {
            include: [{
                model: TaskApplication,
                as: 'Applications',
                attributes: ['ApplicationID', 'Status', 'Applicant_ID'],
                include: [{
                    model: User,
                    as: 'ApplicantDetails',
                    attributes: ['UserID'],
                    include: [{
                        model: Applicant,
                        as: 'ApplicantProfile',
                        attributes: ['Applicant_ID', 'First_Name', 'Surname'],
                    }]
                }]
            }],
        });

        res.status(200).json({
            success: true,
            message: 'Task marked as filled successfully!',
            task: {
                id: updatedTaskFull.TaskID,
                jobTitle: updatedTaskFull.Title,
                location: updatedTaskFull.Location,
                budget: parseFloat(updatedTaskFull.Budget),
                dueDate: formatDate(updatedTaskFull.Deadline),
                applicants: updatedTaskFull.Applications.map(app => ({
                    id: app.Applicant_ID,
                    name: app.ApplicantDetails?.ApplicantProfile ? `${app.ApplicantDetails.ApplicantProfile.First_Name} ${app.ApplicantDetails.ApplicantProfile.Surname}` : 'N/A',
                    skills: [] // Skills not fetched here, can add if needed
                })),
                filledDate: formatDate(updatedTaskFull.FilledDate),
                description: updatedTaskFull.Description,
                status: updatedTaskFull.TaskStatus.toLowerCase(),
                selectedApplicantId: updatedTaskFull.SelectedApplicantID, // Will be null unless hired through 'hire'
                selectedApplicantName: updatedTaskFull.SelectedApplicantName, // Will be null unless hired through 'hire'
            }
        });

    } catch (error) {
        console.error('Error marking task as filled:', error);
        res.status(500).json({ message: 'Server error while marking task as filled.', error: error.message });
    }
});

// @route   PUT /api/client/tasks/:taskId/reopen
// @desc    Reopen a job (change status back to 'Open')
// @access  Private (Client role)
router.put('/tasks/:taskId/reopen', async (req, res) => {
    try {
        const { taskId } = req.params;
        const clientId = req.user.UserID;

        const task = await Task.findOne({ where: { TaskID: taskId, ClientID: clientId } });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you are not the owner.' });
        }

        if (task.TaskStatus === 'Open') {
            return res.status(400).json({ message: 'Task is already open.' });
        }

        task.TaskStatus = 'Open';
        task.SelectedApplicantID = null; // Clear selected applicant
        task.SelectedApplicantName = null; // Clear selected applicant name
        task.FilledDate = null; // Clear filled date
        await task.save();

        // Re-fetch to return comprehensive task data
        const updatedTaskFull = await Task.findByPk(task.TaskID, {
            include: [{
                model: TaskApplication,
                as: 'Applications',
                attributes: ['ApplicationID', 'Status', 'Applicant_ID'],
                include: [{
                    model: User,
                    as: 'ApplicantDetails',
                    attributes: ['UserID'],
                    include: [{
                        model: Applicant,
                        as: 'ApplicantProfile',
                        attributes: ['Applicant_ID', 'First_Name', 'Surname'],
                    }]
                }]
            }],
        });

        res.status(200).json({
            success: true,
            message: 'Job reopened successfully!',
            task: {
                id: updatedTaskFull.TaskID,
                jobTitle: updatedTaskFull.Title,
                location: updatedTaskFull.Location,
                budget: parseFloat(updatedTaskFull.Budget),
                dueDate: formatDate(updatedTaskFull.Deadline),
                applicants: updatedTaskFull.Applications.map(app => ({
                    id: app.Applicant_ID,
                    name: app.ApplicantDetails?.ApplicantProfile ? `${app.ApplicantDetails.ApplicantProfile.First_Name} ${app.ApplicantDetails.ApplicantProfile.Surname}` : 'N/A',
                    skills: []
                })),
                filledDate: formatDate(updatedTaskFull.FilledDate),
                description: updatedTaskFull.Description,
                status: updatedTaskFull.TaskStatus.toLowerCase(),
                selectedApplicantId: updatedTaskFull.SelectedApplicantID,
                selectedApplicantName: updatedTaskFull.SelectedApplicantName,
            }
        });

    } catch (error) {
        console.error('Error reopening job:', error);
        res.status(500).json({ message: 'Server error while reopening job.', error: error.message });
    }
});

// @route   DELETE /api/client/tasks/:taskId
// @desc    Client deletes a task they own
// @access  Private (Client role)
router.delete('/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const clientId = req.user.UserID;

        const task = await Task.findOne({ where: { TaskID: taskId, ClientID: clientId } });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you are not authorized to delete it.' });
        }

        await task.destroy(); // Deletes the task
        res.status(200).json({ success: true, message: 'Task deleted successfully!' });

    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error while deleting task.', error: error.message });
    }
});

// @route   PUT /api/client/tasks/:taskId/hire
// @desc    Hire an applicant for a task
// @access  Private (Client role)
router.put('/tasks/:taskId/hire', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { applicantId } = req.body;
        const clientId = req.user.UserID;

        const task = await Task.findOne({ where: { TaskID: taskId, ClientID: clientId } });
        if (!task) {
            return res.status(404).json({ message: 'Task not found or you are not the owner.' });
        }

        const application = await TaskApplication.findOne({
            where: {
                Task_ID: taskId,
                Applicant_ID: applicantId
            }
        });

        if (!application) {
            return res.status(404).json({ message: 'Applicant has not applied for this task.' });
        }

        // Fetch applicant's name for setting on task and response
        const applicantUser = await User.findOne({
            where: { UserID: applicantId },
            include: [{ model: Applicant, as: 'ApplicantProfile', attributes: ['First_Name', 'Surname'] }]
        });
        const selectedApplicantName = applicantUser && applicantUser.ApplicantProfile ?
            `${applicantUser.ApplicantProfile.First_Name} ${applicantUser.ApplicantProfile.Surname}` : null;


        // Update the task status to 'Filled' and set selected applicant details
        task.TaskStatus = 'Filled';
        task.SelectedApplicantID = applicantId;
        task.SelectedApplicantName = selectedApplicantName;
        task.FilledDate = new Date(); // Set filled date when hired
        await task.save();

        // Update the application status to 'Approved'
        application.Status = 'Approved';
        await application.save();

        // Re-fetch the task to return updated details for the frontend
        const updatedTaskFull = await Task.findByPk(task.TaskID, {
            include: [{
                model: TaskApplication,
                as: 'Applications',
                attributes: ['ApplicationID', 'Status', 'Applicant_ID'],
                include: [{
                    model: User,
                    as: 'ApplicantDetails',
                    attributes: ['UserID'],
                    include: [{
                        model: Applicant,
                        as: 'ApplicantProfile',
                        attributes: ['Applicant_ID', 'First_Name', 'Surname'],
                    }]
                }]
            }],
        });

        res.status(200).json({
            success: true,
            message: `Successfully hired ${selectedApplicantName || 'applicant'} for the task!`,
            task: {
                id: updatedTaskFull.TaskID,
                jobTitle: updatedTaskFull.Title,
                location: updatedTaskFull.Location,
                budget: parseFloat(updatedTaskFull.Budget),
                dueDate: formatDate(updatedTaskFull.Deadline),
                applicants: updatedTaskFull.Applications.map(app => ({
                    id: app.Applicant_ID,
                    name: app.ApplicantDetails?.ApplicantProfile ? `${app.ApplicantDetails.ApplicantProfile.First_Name} ${app.ApplicantDetails.ApplicantProfile.Surname}` : 'N/A',
                    skills: []
                })),
                filledDate: formatDate(updatedTaskFull.FilledDate),
                description: updatedTaskFull.Description,
                status: updatedTaskFull.TaskStatus.toLowerCase(),
                selectedApplicantId: updatedTaskFull.SelectedApplicantID,
                selectedApplicantName: updatedTaskFull.SelectedApplicantName,
            }
        });

    } catch (error) {
        console.error('Error hiring applicant:', error);
        res.status(500).json({ message: 'Server error while hiring applicant.', error: error.message });
    }
});

/// @route   GET /api/client/applicant-profile/:applicantId
// @desc    Client gets the full profile details of a specific applicant
// @access  Private (Client role)
router.get('/applicant-profile/:applicantId', async (req, res) => {
    try {
        const { applicantId } = req.params;

        // This is the fully corrected database query
        const applicantProfile = await db.Applicant.findOne({
            where: { Applicant_ID: applicantId },
            include: [
                { 
                    model: db.User, 
                    as: 'UserAccountDetails', 
                    attributes: ['Email'] 
                },
                { 
                    model: db.Education, 
                    as: 'Educations' 
                },
                { 
                    model: db.WorkExperience, 
                    as: 'WorkExperiences',
                    // THIS WAS THE MISSING PIECE: We also need to include the company details for each work experience
                    include: [{
                        model: db.CompanyInformation,
                        as: 'CompanyDetails'
                    }]
                },
                { 
                    model: db.Certification, 
                    as: 'Certifications' 
                },
                { 
                    model: db.Preference, 
                    as: 'Preferences'
                },
                { 
                    model: db.JobCategory, 
                    as: 'JobCategories', 
                    through: { attributes: [] } 
                },
                { 
                    model: db.Location, 
                    as: 'Locations', 
                    through: { attributes: [] } 
                }
            ]
        });

        if (!applicantProfile) {
            return res.status(404).json({ message: 'Applicant profile not found.' });
        }

        res.status(200).json({
            success: true,
            profileData: applicantProfile,
        });

    } catch (error) {
        // It's helpful to log the full error on the backend for debugging
        console.error('Error fetching applicant profile for client:', error);
        res.status(500).json({ message: 'Server error while fetching applicant profile.' });
    }
});

// This file effectively acts as a clientController now

module.exports = router;