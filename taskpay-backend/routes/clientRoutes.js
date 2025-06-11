/**
 * @file clientRoutes.js
 * @description Defines API routes for client-specific functionalities.
 * @modification
 * Corrected route paths to match frontend API calls (/stats, /tasks, /profile).
 * Added /profile and /completed-tasks routes.
 */

const express = require('express');
const router = express.Router();
// CORRECTED: authorize was being destructured from authMiddleware, but it's not exported like that.
// The file exports authorizeClient directly, so we'll use that as per the original file.
const { protect, authorizeClient } = require('../middleware/authMiddleware');

// Import all necessary models and Sequelize for operators
const {
    Task, TaskApplication, User, Applicant, Education, WorkExperience,
    Certification, Preference, CompanyInformation, Attachment, Sequelize
} = require('../models');
const { Op } = Sequelize;

// @route   GET /api/clients/profile
// @desc    Get the profile of the currently logged-in client
// @access  Private (Client only)
router.get('/profile', protect, authorizeClient, async (req, res) => {
    try {
        const clientId = req.user.UserID;

        // Since signup is generic, the client's name is in the Applicant table.
        const clientProfile = await Applicant.findOne({
            where: { Applicant_ID: clientId },
            attributes: ['First_Name', 'Surname']
        });

        if (!clientProfile) {
            const user = await User.findByPk(clientId, { attributes: ['Email'] });
            return res.status(404).json({
                message: 'Client profile details not found.',
                profile: { Email: user?.Email }
            });
        }
        
        res.status(200).json(clientProfile);

    } catch (error) {
        console.error('Get Client Profile Error:', error);
        res.status(500).json({ message: 'Server error while fetching client profile.' });
    }
});

// @route   GET /api/clients/stats
// @desc    Get dashboard statistics for the logged-in client
// @access  Private (Client only)
router.get('/stats', protect, authorizeClient, async (req, res) => {
    const clientId = req.user.UserID;
    try {
        const [
            filledTasksCount,
            openTasksCount,
            completedTasksCount,
            totalApplicationsCount
        ] = await Promise.all([
            Task.count({ where: { ClientID: clientId, TaskStatus: 'Filled' } }),
            Task.count({ where: { ClientID: clientId, TaskStatus: 'Open' } }),
            Task.count({ where: { ClientID: clientId, TaskStatus: 'Completed' } }),
            TaskApplication.count({
                include: [{
                    model: Task,
                    as: 'TaskDetails',
                    where: { ClientID: clientId },
                    attributes: []
                }]
            })
        ]);
        res.status(200).json({
            filledTasks: filledTasksCount,
            openTasks: openTasksCount,
            totalApplications: totalApplicationsCount,
            completedTasks: completedTasksCount
        });
    } catch (error) {
        console.error('Get Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard stats.', error: error.message });
    }
});


// @route   GET /api/clients/tasks
// @desc    Get all tasks posted by the logged-in client
// @access  Private (Client only)
router.get('/tasks', protect, authorizeClient, async (req, res) => {
    const clientId = req.user.UserID;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const offset = (page - 1) * limit;

    const statusFilter = req.query.status;
    const whereClause = { ClientID: clientId };
    if (statusFilter) {
        whereClause.TaskStatus = { [Op.in]: statusFilter.split(',') };
    }

    try {
        const { count, rows: tasks } = await Task.findAndCountAll({
            where: whereClause,
            attributes: {
                include: [[
                    Sequelize.literal(`(SELECT COUNT(*) FROM TaskApplications AS ta WHERE ta.Task_ID = Task.TaskID)`),
                    'applicantCount'
                ]]
            },
            limit,
            offset,
            order: [['PostedDate', 'DESC']]
        });
        res.status(200).json({ totalTasks: count, totalPages: Math.ceil(count / limit), currentPage: page, tasks });
    } catch (error) {
        console.error('Get My Tasks Error:', error);
        res.status(500).json({ message: 'Server error while fetching tasks.', error: error.message });
    }
});

// @route   GET /api/clients/completed-tasks
// @desc    Get all completed tasks for the logged-in client
// @access  Private (Client only)
router.get('/completed-tasks', protect, authorizeClient, async (req, res) => {
    const clientId = req.user.UserID;
    try {
        const completedTasks = await Task.findAll({
            where: {
                ClientID: clientId,
                TaskStatus: 'Completed'
            },
            order: [['updatedAt', 'DESC']]
        });
        res.status(200).json({ completedTasks });
    } catch (error) {
        console.error('Get Completed Tasks Error:', error);
        res.status(500).json({ message: 'Server error while fetching completed tasks.' });
    }
});


// @route   GET /api/clients/tasks/:taskId/applicants
// @desc    Get all applicants for a specific task owned by the client
// @access  Private (Client only)
router.get('/tasks/:taskId/applicants', protect, authorizeClient, async (req, res) => {
    const { taskId } = req.params;
    const clientId = req.user.UserID;
    try {
        const task = await Task.findOne({ where: { TaskID: taskId, ClientID: clientId } });
        if (!task) {
            return res.status(404).json({ message: 'Task not found or you are not authorized.' });
        }
        const applications = await TaskApplication.findAll({
            where: { Task_ID: taskId },
            include: [{
                model: User, as: 'ApplicantDetails', attributes: ['UserID', 'Email'],
                include: [{
                    model: Applicant, as: 'ApplicantProfile',
                    include: [{ model: Preference, as: 'Preferences' }]
                }]
            }]
        });
        if (!applications || applications.length === 0) {
            return res.status(404).json({ message: 'No applicants found for this task yet.' });
        }
        res.status(200).json(applications);
    } catch (error) {
        console.error('Get Task Applicants Error:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});


// @route   GET /api/clients/applicants/:applicantId
// @desc    Client views the full profile of a specific applicant for one of their tasks
// @access  Private (Client only)
router.get('/applicants/:applicantId', protect, authorizeClient, async (req, res) => {
    const { applicantId } = req.params;
    const clientId = req.user.UserID;
    try {
        const clientTaskIds = (await Task.findAll({
            where: { ClientID: clientId }, attributes: ['TaskID']
        })).map(task => task.TaskID);

        if (clientTaskIds.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You have no tasks to view applicants for.' });
        }
        const hasApplied = await TaskApplication.findOne({
            where: { Applicant_ID: applicantId, Task_ID: { [Op.in]: clientTaskIds } }
        });
        if (!hasApplied) {
            return res.status(403).json({ message: 'Forbidden: You can only view profiles of applicants who have applied to your tasks.' });
        }
        const applicantUser = await User.findByPk(applicantId, {
            attributes: { exclude: ['PasswordHash'] },
            include: [{
                model: Applicant, as: 'ApplicantProfile', required: true,
                include: [
                    { model: Education, as: 'Educations' },
                    { model: WorkExperience, as: 'WorkExperiences', include: [{ model: CompanyInformation, as: 'CompanyDetails' }] },
                    { model: Certification, as: 'Certifications' },
                    { model: Preference, as: 'Preferences' },
                    { model: Attachment, as: 'Attachments' }
                ]
            }]
        });
        if (!applicantUser) {
            return res.status(404).json({ message: 'Applicant profile not found.' });
        }
        res.status(200).json(applicantUser);
    } catch (error) {
        console.error('Client View Applicant Profile Error:', error);
        res.status(500).json({ message: 'Server error while fetching applicant profile.', error: error.message });
    }
});

module.exports = router;