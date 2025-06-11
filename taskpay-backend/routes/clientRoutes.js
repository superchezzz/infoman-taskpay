const express = require('express');
const router = express.Router();
const { protect, authorizeClient } = require('../middleware/authMiddleware');

const {
    Task, TaskApplication, User, Applicant, Preference, Sequelize
} = require('../models');
const { Op } = Sequelize;

// @route   GET /api/clients/profile
// @desc    Get the profile of the currently logged-in client
// @access  Private (Client only)
router.get('/profile', protect, authorizeClient, async (req, res) => {
    try {
        const clientId = req.user.UserID;
        const clientProfile = await Applicant.findOne({
            where: { Applicant_ID: clientId },
            attributes: ['First_Name', 'Surname']
        });
        if (!clientProfile) {
            const user = await User.findByPk(clientId, { attributes: ['Email'] });
            return res.status(200).json({ First_Name: user?.Email, Surname: '' });
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
        const [filledTasks, openTasks, completedTasks, totalApplications] = await Promise.all([
            Task.count({ where: { ClientID: clientId, TaskStatus: 'Filled' } }),
            Task.count({ where: { ClientID: clientId, TaskStatus: 'Open' } }),
            Task.count({ where: { ClientID: clientId, TaskStatus: 'Completed' } }),
            TaskApplication.count({
                include: [{ model: Task, as: 'TaskDetails', where: { ClientID: clientId }, attributes: [] }]
            })
        ]);
        res.status(200).json({ filledTasks, openTasks, totalApplications, completedTasks });
    } catch (error) {
        console.error('Get Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard stats.' });
    }
});

// @route   GET /api/clients/tasks
// @desc    Get all tasks posted by the logged-in client (for the main list)
// @access  Private (Client only)
router.get('/tasks', protect, authorizeClient, async (req, res) => {
    const clientId = req.user.UserID;
    try {
        const tasks = await Task.findAll({
            where: { ClientID: clientId },
            order: [['PostedDate', 'DESC']]
        });
        res.status(200).json({ tasks });
    } catch (error) {
        console.error('Get Client Tasks Error:', error);
        res.status(500).json({ message: 'Server error while fetching tasks.' });
    }
});

// @route   GET /api/clients/completed-tasks
// @desc    Get all completed tasks for the logged-in client
// @access  Private (Client only)
router.get('/completed-tasks', protect, authorizeClient, async (req, res) => {
    const clientId = req.user.UserID;
    try {
        const completedTasks = await Task.findAll({
            where: { ClientID: clientId, TaskStatus: 'Completed' },
            order: [['updatedAt', 'DESC']]
        });
        res.status(200).json({ completedTasks });
    } catch (error) {
        console.error('Get Completed Tasks Error:', error);
        res.status(500).json({ message: 'Server error while fetching completed tasks.' });
    }
});

// Other specific routes can remain
// ...

module.exports = router;