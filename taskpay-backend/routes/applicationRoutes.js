/**
 * @file applicationRoutes.js
 * @description Defines API routes for applicants managing their task applications.
 *
 * @description
 * This file handles all actions an applicant can take on their applications,
 * such as applying for a task, viewing their application list, and updating
 * the status of an application (withdrawing, starting, completing).
 * All routes in this file are protected and require user authentication.
 *
 * @modification
 * Added new POST routes to handle status changes for a task application:
 * - POST /:applicationId/withdraw: Allows an applicant to withdraw their application.
 * - POST /:applicationId/start: Allows an applicant to mark an approved task as 'InProgress'.
 * - POST /:applicationId/complete: Allows an applicant to submit a completed task for review.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import models and Sequelize library (for Op) from the central models/index.js
const { Task, TaskApplication, User, Sequelize } = require('../models');
const { Op } = Sequelize;

// A helper function to find an application and verify ownership
const findApplicationAndVerifyOwner = async (applicationId, applicantId) => {
    const application = await TaskApplication.findByPk(applicationId);

    if (!application) {
        return { error: 'Application not found.', status: 404, application: null };
    }

    if (application.Applicant_ID !== applicantId) {
        return { error: 'Forbidden: You are not authorized to modify this application.', status: 403, application: null };
    }

    return { error: null, status: 200, application };
};

// @route   POST /api/applications/tasks/:taskId/apply
// @desc    Applicant applies for a specific task
// @access  Private
router.post('/tasks/:taskId/apply', protect, async (req, res) => {
    const { taskId } = req.params;
    const applicantId = req.user.UserID;
    const { CoverLetter, ApplicantProposedBudget } = req.body;

    try {
        const task = await Task.findByPk(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found.' });
        if (task.TaskStatus !== 'Open') return res.status(400).json({ message: 'This task is no longer open for applications.' });

        const userMakingApplication = await User.findByPk(applicantId, { include: { model: db.Role, as: 'Roles' } });
        if (!userMakingApplication || !userMakingApplication.Roles.some(role => role.RoleName === 'applicant')) {
            return res.status(403).json({ message: 'Only applicants can apply for tasks.' });
        }

        const existingApplication = await TaskApplication.findOne({
            where: { Applicant_ID: applicantId, Task_ID: taskId }
        });
        if (existingApplication) return res.status(400).json({ message: 'You have already applied for this task.' });

        const newApplication = await TaskApplication.create({
            Applicant_ID: applicantId, Task_ID: taskId, CoverLetter, ApplicantProposedBudget, Status: 'Pending'
        });
        res.status(201).json({ message: 'Successfully applied for the task.', application: newApplication });
    } catch (error) {
        console.error('Apply for Task Error:', error);
        res.status(500).json({ message: 'Server error while applying for task.', error: error.message });
    }
});

// @route   GET /api/applications/my
// @desc    Get all task applications for the logged-in applicant
// @access  Private
router.get('/my', protect, async (req, res) => {
    const applicantId = req.user.UserID;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status ? req.query.status.split(',') : null;

    try {
        const whereClause = { Applicant_ID: applicantId };
        if (statusFilter) {
            whereClause.Status = { [Op.in]: statusFilter };
        }

        const { count, rows: applications } = await TaskApplication.findAndCountAll({
            where: whereClause,
            include: [{
                model: Task, as: 'TaskDetails',
                attributes: ['TaskID', 'Title', 'Budget', 'ClientName', 'Deadline', 'Category']
            }],
            limit, offset, order: [['ApplicationDate', 'DESC']]
        });
        if (!applications || applications.length === 0) {
            return res.status(404).json({ message: 'No task applications found.' });
        }
        res.status(200).json({ totalApplications: count, totalPages: Math.ceil(count / limit), currentPage: page, applications });
    } catch (error) {
        console.error('Get My Applications Error:', error);
        res.status(500).json({ message: 'Server error while fetching your applications.', error: error.message });
    }
});

// --- NEW: Applicant Action Routes ---

// @route   POST /api/applications/:applicationId/withdraw
// @desc    Applicant withdraws their application for a task
// @access  Private
router.post('/:applicationId/withdraw', protect, async (req, res) => {
    const { applicationId } = req.params;
    const applicantId = req.user.UserID;

    try {
        const { error, status, application } = await findApplicationAndVerifyOwner(applicationId, applicantId);
        if (error) return res.status(status).json({ message: error });

        // Business logic: Check if the application is in a state that can be withdrawn
        if (!['Pending', 'Approved'].includes(application.Status)) {
            return res.status(400).json({ message: `Cannot withdraw an application with status: ${application.Status}` });
        }

        application.Status = 'Withdrawn';
        await application.save();

        res.status(200).json({ message: 'Application successfully withdrawn.', application });
    } catch (error) {
        console.error('Withdraw Application Error:', error);
        res.status(500).json({ message: 'Server error while withdrawing application.', error: error.message });
    }
});

// @route   POST /api/applications/:applicationId/start
// @desc    Applicant starts working on an approved task
// @access  Private
router.post('/:applicationId/start', protect, async (req, res) => {
    const { applicationId } = req.params;
    const applicantId = req.user.UserID;

    try {
        const { error, status, application } = await findApplicationAndVerifyOwner(applicationId, applicantId);
        if (error) return res.status(status).json({ message: error });

        // Business logic: A task can only be started if it has been approved by a client/admin
        if (application.Status !== 'Approved') {
            return res.status(400).json({ message: `Task cannot be started. Current status is: ${application.Status}. It must be 'Approved'.` });
        }

        application.Status = 'InProgress';
        await application.save();

        // Optional: Also update the main Task's status
        await Task.update({ TaskStatus: 'In Progress' }, { where: { TaskID: application.Task_ID } });

        res.status(200).json({ message: 'Task has been marked as In Progress.', application });
    } catch (error) {
        console.error('Start Task Error:', error);
        res.status(500).json({ message: 'Server error while starting task.', error: error.message });
    }
});

// @route   POST /api/applications/:applicationId/complete
// @desc    Applicant marks a task as complete and submits it for review
// @access  Private
router.post('/:applicationId/complete', protect, async (req, res) => {
    const { applicationId } = req.params;
    const applicantId = req.user.UserID;

    try {
        const { error, status, application } = await findApplicationAndVerifyOwner(applicationId, applicantId);
        if (error) return res.status(status).json({ message: error });

        // Business logic: A task can only be completed if it is In Progress
        if (application.Status !== 'InProgress') {
            return res.status(400).json({ message: `Task cannot be completed. Current status is: ${application.Status}. It must be 'InProgress'.` });
        }

        // We change the status to 'SubmittedForReview' to indicate that the client/admin
        // needs to verify the work before it's officially 'Completed'.
        application.Status = 'SubmittedForReview';
        await application.save();

        res.status(200).json({ message: 'Task has been submitted for review.', application });
    } catch (error) {
        console.error('Complete Task Error:', error);
        res.status(500).json({ message: 'Server error while completing task.', error: error.message });
    }
});


// This is needed for the check in the apply route if db is not destructured at the top
const db = require('../models');

module.exports = router;