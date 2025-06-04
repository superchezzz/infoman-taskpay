const express = require('express');
const router = express.Router();
// Import models and Sequelize library (for Op) from the central models/index.js
const { Task, TaskApplication, User, Sequelize } = require('../models');
const { Op } = Sequelize; // Sequelize.Op

// @route   GET /api/tasks/available
// @desc    Get a list of all available tasks (TaskStatus = 'Open') with pagination
// @access  Public
router.get('/available', async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
        const { count, rows: tasks } = await Task.findAndCountAll({
            where: { TaskStatus: 'Open' },
            limit,
            offset,
            order: [['PostedDate', 'DESC']]
            // Add includes if needed (e.g., User as ClientPoster)
        });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No available tasks found.' });
        }
        res.status(200).json({
            totalTasks: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            tasks
        });
    } catch (error) {
        console.error('Get Available Tasks Error:', error);
        res.status(500).json({ message: 'Server error while fetching available tasks.', error: error.message });
    }
});

// @route   GET /api/tasks/:taskId
// @desc    Get details of a specific task
// @access  Public
router.get('/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findByPk(taskId, {
            // Add includes if needed
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        const applicantCount = await TaskApplication.count({ where: { Task_ID: taskId } });
        res.status(200).json({ ...task.get({ plain: true }), applicantCount });
    } catch (error) {
        console.error('Get Task Details Error:', error);
        res.status(500).json({ message: 'Server error while fetching task details.', error: error.message });
    }
});

module.exports = router;