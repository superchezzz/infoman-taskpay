/**
 * @file applicationRoutes.js
 * @description Defines API routes for managing task applications.
 * @modification
 * - Corrected the `/apply` route to allow re-application for withdrawn/rejected tasks.
 * - Removed a duplicate `/withdraw` route.
 */

const express = require('express');
const router = express.Router();
const { protect, authorize, authorizeClient } = require('../middleware/authMiddleware'); // Added authorize for completeness

const { Task, TaskApplication, User, Role, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

// --- Helper Functions (These are well-written, no changes needed) ---
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
// @desc    Applicant applies for a specific task, or re-applies if withdrawn.
// @access  Private (Applicant only)
router.post('/tasks/:taskId/apply', protect, authorize('applicant'), async (req, res) => {
    const { taskId } = req.params;
    const applicantId = req.user.UserID;

    try {
        const task = await Task.findByPk(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found.' });
        if (task.TaskStatus !== 'Open') return res.status(400).json({ message: 'This task is no longer open for applications.' });

        // --- THIS IS THE CORRECTED LOGIC ---
        // Use findOrCreate to handle both new and existing applications cleanly.
        const [application, created] = await TaskApplication.findOrCreate({
            where: {
                Applicant_ID: applicantId,
                Task_ID: parseInt(taskId, 10)
            },
            defaults: { Status: 'Pending' }
        });

        if (created) {
            // If the application was just created, it's a success.
            return res.status(201).json({ message: 'Successfully applied for the task.', application });
        }

        // If an application already existed, check its status to allow re-application.
        if (['Withdrawn', 'Rejected', 'Cancelled'].includes(application.Status)) {
            application.Status = 'Pending';
            await application.save();
            return res.status(200).json({ message: 'Re-applied to task successfully!', application });
        } else {
            // Otherwise, they have an active application and cannot apply again.
            return res.status(400).json({ message: 'You have already applied for this task.' });
        }
        
    } catch (error) {
        console.error('Apply for Task Error:', error);
        res.status(500).json({ message: 'Server error while applying for task.', error: error.message });
    }
});

// @route   GET /api/applications/my (Unchanged)
// @desc    Get all task applications for the logged-in applicant
// @access  Private (Applicant only)
router.get('/my', protect, authorize('applicant'), async (req, res) => {
    // This route logic is fine, no changes needed.
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
            include: [{ model: Task, as: 'TaskDetails', attributes: ['TaskID', 'Title', 'Budget', 'ClientName', 'Deadline', 'Category']}],
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


// @route   POST /api/applications/:applicationId/approve (Unchanged)
// @desc    Client approves an applicant's application for a task.
// @access  Private (Client only)
router.post('/:applicationId/approve', protect, authorizeClient, async (req, res) => {
    // This route logic is fine, no changes needed.
    const { applicationId } = req.params;
    const clientId = req.user.UserID;
    const t = await sequelize.transaction();
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
        applicationToApprove.Status = 'Approved';
        await applicationToApprove.save({ transaction: t });
        task.TaskStatus = 'Filled';
        await task.save({ transaction: t });
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


// @route   POST /api/applications/:applicationId/withdraw (Keeping the better version)
// @desc    Applicant withdraws their application for a task
// @access  Private (Applicant only)
router.post('/:applicationId/withdraw', protect, authorize('applicant'), async (req, res) => {
    const { applicationId } = req.params;
    const applicantId = req.user.UserID;
    const t = await sequelize.transaction();
    try {
        const { error, status, application } = await findApplicationAndVerifyApplicant(applicationId, applicantId);
        if (error) {
            await t.rollback();
            return res.status(status).json({ message: error });
        }
        const originalStatus = application.Status;
        if (!['Pending', 'Approved', 'Shortlisted'].includes(originalStatus)) { // Added 'Shortlisted'
            await t.rollback();
            return res.status(400).json({ message: `Cannot withdraw application with status: ${originalStatus}` });
        }
        application.Status = 'Withdrawn';
        await application.save({ transaction: t });
        if (originalStatus === 'Approved') {
            await Task.update(
                {
                    TaskStatus: 'Open',          // Reopen the task
                    SelectedApplicantID: null,   // <-- NEW: Clear the selected applicant ID
                    SelectedApplicantName: null, // <-- NEW: Clear the selected applicant name
                    FilledDate: null             // <-- NEW: Clear the filled date
                },
                {
                    where: { TaskID: application.Task_ID },
                    transaction: t
                }
            );
        }
        await t.commit();
        res.status(200).json({ message: 'Application successfully withdrawn.', application });
    } catch (error) {
        await t.rollback();
        console.error('Withdraw Application Error:', error);
        res.status(500).json({ message: 'Server error during withdrawal.', error: error.message });
    }
});


// Other routes like /start, /complete, /history are also fine, no changes needed.
router.post('/:applicationId/start', protect, authorize('applicant'), async (req, res) => {
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

router.post('/:applicationId/complete', protect, authorize('applicant'), async (req, res) => {
    const { applicationId } = req.params;
    const applicantId = req.user.UserID;
    const t = await sequelize.transaction(); // Use a transaction for safety

    try {
        const { error, status, application } = await findApplicationAndVerifyApplicant(applicationId, applicantId);
        if (error) {
            await t.rollback();
            return res.status(status).json({ message: error });
        }

        // Only allow completion if the task is InProgress
        if (application.Status !== 'InProgress') {
            await t.rollback();
            return res.status(400).json({ message: `Task cannot be completed. Status is: ${application.Status}.` });
        }

        // Update both the application and the main task status to 'Completed'
        application.Status = 'Completed';
        await application.save({ transaction: t });
        
        await Task.update(
            { TaskStatus: 'Completed' },
            { where: { TaskID: application.Task_ID }, transaction: t }
        );

        await t.commit();
        res.status(200).json({ message: 'Task marked as completed!', application });
    } catch (error) {
        await t.rollback();
        console.error('Complete Task Error:', error);
        res.status(500).json({ message: 'Server error while completing task.', error: error.message });
    }
});

router.get('/history', protect, authorize('applicant'), async (req, res) => {
    const applicantId = req.user.UserID;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const offset = (page - 1) * limit;
    try {
        const { count, rows: historyApplications } = await TaskApplication.findAndCountAll({
            where: {
                Applicant_ID: applicantId,
                Status: { [Op.in]: ['Completed', 'Withdrawn', 'Rejected', 'Cancelled'] }
            },
            include: [{
                model: Task,
                as: 'TaskDetails',
                attributes: [ 'TaskID', 'Title', 'Description', 'Budget', 'Deadline', 'PostedDate', 'Duration', 'ClientName', 'Category', 'Location',
                    [Sequelize.literal(`(SELECT COUNT(*) FROM TaskApplications AS ta WHERE ta.Task_ID = \`TaskDetails\`.\`TaskID\` AND ta.Status IN ('Pending', 'ViewedByAdmin', 'Shortlisted', 'Approved', 'InProgress', 'SubmittedForReview'))`), 'applicantCount']
                ]
            }],
            limit,
            offset,
            order: [['ApplicationDate', 'DESC']]
        });
        const totalPages = Math.ceil(count / limit);
        res.status(200).json({ history: historyApplications || [], totalApplications: count, totalPages: totalPages, currentPage: page });
    } catch (error) {
        console.error('Get Task History Error:', error);
        res.status(500).json({ message: 'Server error while fetching task history.', error: error.message });
    }
});

// --- REMOVED THE DUPLICATE /withdraw ROUTE ---

module.exports = router;