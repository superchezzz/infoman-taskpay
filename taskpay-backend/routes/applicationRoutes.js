/**
 * @file applicationRoutes.js
 * @description Defines API routes for managing task applications.
 *
 * @description
 * This file handles actions on applications, such as applying for a task,
 * viewing applications, and updating application status.
 *
 * @modification
 * Added the POST /:applicationId/approve endpoint. This allows a client
 * to approve an applicant for a task they own. This is a critical piece of
 * business logic that updates the application status, the task status, and
 * rejects other pending applications for the same task.
 */

const express = require('express');
const router = express.Router();
const { protect, authorizeClient } = require('../middleware/authMiddleware');

// Import all necessary models and the sequelize instance from the central models/index.js
const { Task, TaskApplication, User, Applicant, Role, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

// --- Helper Functions for Verification ---

/**
 * Finds an application and verifies that the logged-in user is the applicant who owns it.
 * @param {number} applicationId - The ID of the application.
 * @param {number} applicantId - The ID of the user attempting the action.
 * @returns {Promise<{error: string|null, status: number, application: object|null}>}
 */
const findApplicationAndVerifyApplicant = async (applicationId, applicantId) => {
    const application = await TaskApplication.findByPk(applicationId);

    if (!application) {
        return { error: 'Application not found.', status: 404, application: null };
    }

    if (application.Applicant_ID !== applicantId) {
        return { error: 'Forbidden: You are not authorized to modify this application.', status: 403, application: null };
    }

    return { error: null, status: 200, application };
};

/**
 * Finds a task and verifies that the logged-in user is the client who owns it.
 * @param {number} taskId - The ID of the task.
 * @param {number} clientId - The ID of the user attempting the action.
 * @returns {Promise<{error: string|null, status: number, task: object|null}>}
 */
const findTaskAndVerifyClient = async (taskId, clientId) => {
    const task = await Task.findByPk(taskId);
    if (!task) {
        return { error: 'Task not found.', status: 404, task: null };
    }
    if (task.ClientID !== clientId) {
        return { error: 'Forbidden: You are not authorized to manage this task.', status: 403, task: null };
    }
    return { error: null, status: 200, task };
};


// @route   POST /api/applications/tasks/:taskId/apply
// @desc    Applicant applies for a specific task
// @access  Private (Applicant only)
router.post('/tasks/:taskId/apply', protect, async (req, res) => {
    const { taskId } = req.params;
    const applicantId = req.user.UserID;
    const { CoverLetter, ApplicantProposedBudget } = req.body;

    try {
        const task = await Task.findByPk(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found.' });
        if (task.TaskStatus !== 'Open') return res.status(400).json({ message: 'This task is no longer open for applications.' });

        // Verify the user making the request has the 'applicant' role
        const userMakingApplication = await User.findByPk(applicantId, {
            include: { model: Role, as: 'Roles' }
        });
        if (!userMakingApplication || !userMakingApplication.Roles.some(role => role.RoleName === 'applicant')) {
            return res.status(403).json({ message: 'Only users with an applicant role can apply for tasks.' });
        }

        const existingApplication = await TaskApplication.findOne({
            where: { Applicant_ID: applicantId, Task_ID: taskId }
        });
        if (existingApplication) return res.status(400).json({ message: 'You have already applied for this task.' });

        const newApplication = await TaskApplication.create({
            Applicant_ID: applicantId,
            Task_ID: parseInt(taskId, 10),
            CoverLetter,
            ApplicantProposedBudget,
            Status: 'Pending'
        });
        res.status(201).json({ message: 'Successfully applied for the task.', application: newApplication });
    } catch (error) {
        console.error('Apply for Task Error:', error);
        res.status(500).json({ message: 'Server error while applying for task.', error: error.message });
    }
});

// @route   GET /api/applications/my
// @desc    Get all task applications for the logged-in applicant
// @access  Private (Applicant only)
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
                model: Task,
                as: 'TaskDetails',
                attributes: ['TaskID', 'Title', 'Budget', 'ClientName', 'Deadline', 'Category']
            }],
            limit,
            offset,
            order: [['ApplicationDate', 'DESC']]
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


// @route   POST /api/applications/:applicationId/approve
// @desc    Client approves an applicant's application for a task.
// @access  Private (Client only)
router.post('/:applicationId/approve', protect, authorizeClient, async (req, res) => {
    const { applicationId } = req.params;
    const clientId = req.user.UserID;

    const t = await sequelize.transaction(); // Use lowercase sequelize instance

    try {
        const applicationToApprove = await TaskApplication.findByPk(applicationId);
        if (!applicationToApprove) {
            await t.rollback();
            return res.status(404).json({ message: 'Application not found.' });
        }

        const { error, status, task } = await findTaskAndVerifyClient(applicationToApprove.Task_ID, clientId);
        if (error) {
            await t.rollback();
            return res.status(status).json({ message: error });
        }

        if (task.TaskStatus !== 'Open') {
            await t.rollback();
            return res.status(400).json({ message: `This task is no longer open. Current status: ${task.TaskStatus}` });
        }

        // Update the approved application's status.
        applicationToApprove.Status = 'Approved';
        await applicationToApprove.save({ transaction: t });

        // Update the main task's status to 'Filled'.
        task.TaskStatus = 'Filled';
        await task.save({ transaction: t });

        // Reject all other pending applications for this task.
        await TaskApplication.update(
            { Status: 'Rejected' },
            { where: { Task_ID: task.TaskID, Status: 'Pending' }, transaction: t }
        );

        await t.commit();
        res.status(200).json({ message: 'Applicant approved successfully. Task is now filled.', application: applicationToApprove });

    } catch (error) {
        await t.rollback();
        console.error('Approve Application Error:', error);
        res.status(500).json({ message: 'Server error while approving application.', error: error.message });
    }
});


// @route   POST /api/applications/:applicationId/withdraw
// @desc    Applicant withdraws their application for a task
// @access  Private (Applicant only)
router.post('/:applicationId/withdraw', protect, async (req, res) => {
    const { applicationId } = req.params;
    const applicantId = req.user.UserID;
    try {
        const { error, status, application } = await findApplicationAndVerifyApplicant(applicationId, applicantId);
        if (error) return res.status(status).json({ message: error });

        if (!['Pending', 'Approved'].includes(application.Status)) {
            return res.status(400).json({ message: `Cannot withdraw application with status: ${application.Status}` });
        }
        application.Status = 'Withdrawn';
        await application.save();
        res.status(200).json({ message: 'Application successfully withdrawn.', application });
    } catch (error) {
        console.error('Withdraw Application Error:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// @route   POST /api/applications/:applicationId/start
// @desc    Applicant starts working on an approved task
// @access  Private (Applicant only)
router.post('/:applicationId/start', protect, async (req, res) => {
    const { applicationId } = req.params;
    const applicantId = req.user.UserID;
    try {
        const { error, status, application } = await findApplicationAndVerifyApplicant(applicationId, applicantId);
        if (error) return res.status(status).json({ message: error });

        if (application.Status !== 'Approved') {
            return res.status(400).json({ message: `Task cannot be started. Status is: ${application.Status}.` });
        }
        application.Status = 'InProgress';
        await application.save();
        await Task.update({ TaskStatus: 'In Progress' }, { where: { TaskID: application.Task_ID } });
        res.status(200).json({ message: 'Task marked as In Progress.', application });
    } catch (error) {
        console.error('Start Task Error:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// @route   POST /api/applications/:applicationId/complete
// @desc    Applicant marks a task as complete and submits it for review
// @access  Private (Applicant only)
router.post('/:applicationId/complete', protect, async (req, res) => {
    const { applicationId } = req.params;
    const applicantId = req.user.UserID;
    try {
        const { error, status, application } = await findApplicationAndVerifyApplicant(applicationId, applicantId);
        if (error) return res.status(status).json({ message: error });

        if (application.Status !== 'InProgress') {
            return res.status(400).json({ message: `Task cannot be completed. Status is: ${application.Status}.` });
        }
        application.Status = 'SubmittedForReview';
        await application.save();
        res.status(200).json({ message: 'Task submitted for review.', application });
    } catch (error) {
        console.error('Complete Task Error:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

module.exports = router;