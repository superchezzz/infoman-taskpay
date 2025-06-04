const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import models and Sequelize library (for Op) from the central models/index.js
const { Task, TaskApplication, User, Applicant, Sequelize } = require('../models');
const { Op } = Sequelize; // Sequelize.Op

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
        if (task.TaskStatus !== 'Open') return res.status(400).json({ message: 'Task no longer open.' });

        // Check if user is an applicant by checking their roles
        const userMakingApplication = await User.findByPk(applicantId, { include: [{ model: db.Role, as: 'Roles' }]});
        if (!userMakingApplication || !userMakingApplication.Roles.some(role => role.RoleName === 'applicant')) {
            return res.status(403).json({ message: 'Only applicants can apply for tasks.' });
        }

        const existingApplication = await TaskApplication.findOne({
            where: { Applicant_ID: applicantId, Task_ID: taskId }
        });
        if (existingApplication) return res.status(400).json({ message: 'You have already applied.' });

        const newApplication = await TaskApplication.create({
            Applicant_ID: applicantId, Task_ID: taskId, CoverLetter, ApplicantProposedBudget, Status: 'Pending'
        });
        res.status(201).json({ message: 'Successfully applied.', application: newApplication });
    } catch (error) {
        console.error('Apply for Task Error:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Server error.', error: error.message });
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
        // Ensure the user making this request is an applicant based on their active token role
        // or by checking their roles from DB if token doesn't have granular active role yet
        if (req.user.role !== 'applicant' && !(await User.findByPk(applicantId, { include: [{model: db.Role, as: 'Roles'}]})).Roles.some(r => r.RoleName === 'applicant') ) {
             return res.status(403).json({ message: 'Access denied. Only for applicants.' });
        }


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
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// Placeholder for db to access Role model in include if not destructured directly
const db = require('../models');

module.exports = router;