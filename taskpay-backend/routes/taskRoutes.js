/**
 * @file taskRoutes.js
 * @description Defines API routes for task-related functionalities.
 *
 * @modification
 * This file handles all general interactions with tasks. This includes public-facing
 * routes for viewing available tasks, as well as protected, client-only routes for
 * creating, editing, deleting, and managing the status of tasks they own.
 */

const express = require('express');
const router = express.Router();
const { protect, authorizeClient } = require('../middleware/authMiddleware');
const { Task, TaskApplication, User, Applicant, Sequelize } = require('../models');
const { Op } = Sequelize;

// @route   POST /api/tasks
// @desc    A logged-in client creates a new task
// @access  Private (Client only)
router.post('/', protect, authorizeClient, async (req, res) => {
    const { Title, Description, Budget, Category, Location, Deadline, Duration } = req.body;

    if (!Title || !Description || !Category) {
        return res.status(400).json({ message: 'Please provide a Title, Description, and Category.' });
    }

    try {
        const clientId = req.user.UserID;
        // Find the user to get their email as a consistent ClientName
        const clientUser = await User.findByPk(clientId);

        // CORRECTED: Use the user's email as the ClientName.
        // This is more reliable than assuming a client has an Applicant profile.
        const clientName = clientUser.Email;

        const newTask = await Task.create({
            ClientID: clientId,
            ClientName: clientName, // Now reliably set to the user's email
            Title, Description, Budget, Category, Location, Deadline, Duration,
            TaskStatus: 'Open'
        });

        res.status(201).json({ message: 'Task created successfully.', task: newTask });

    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ message: 'Server error while creating task.', error: error.message });
    }
});

// @route   PUT /api/tasks/:taskId
// @desc    Client edits a task they own
// @access  Private (Client only)
router.put('/:taskId', protect, authorizeClient, async (req, res) => {
    const { taskId } = req.params;
    const clientId = req.user.UserID;
    const { Title, Description, Budget, Category, Location, Deadline, Duration } = req.body;

    try {
        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        if (task.ClientID !== clientId) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to edit this task.' });
        }

        // Update the task with any new information provided
        task.Title = Title || task.Title;
        task.Description = Description || task.Description;
        task.Budget = Budget || task.Budget;
        task.Category = Category || task.Category;
        task.Location = Location || task.Location;
        task.Deadline = Deadline || task.Deadline;
        task.Duration = Duration || task.Duration;

        const updatedTask = await task.save();
        res.status(200).json({ message: 'Task updated successfully.', task: updatedTask });

    } catch (error) {
        console.error('Update Task Error:', error);
        res.status(500).json({ message: 'Server error while updating task.', error: error.message });
    }
});

// @route   DELETE /api/tasks/:taskId
// @desc    Client deletes a task they own
// @access  Private (Client only)
router.delete('/:taskId', protect, authorizeClient, async (req, res) => {
    const { taskId } = req.params;
    const clientId = req.user.UserID;

    try {
        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        if (task.ClientID !== clientId) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this task.' });
        }

        // Delete the task. Associated TaskApplications will be deleted automatically
        // because of the 'ON DELETE CASCADE' setting in the database foreign key.
        await task.destroy();
        res.status(200).json({ message: 'Task deleted successfully.' });

    } catch (error) {
        console.error('Delete Task Error:', error);
        res.status(500).json({ message: 'Server error while deleting task.', error: error.message });
    }
});

// @route   PUT /api/tasks/:taskId/status
// @desc    Client updates the status of a task they own (e.g., Mark as Filled, Reopen Job)
// @access  Private (Client only)
router.put('/:taskId/status', protect, authorizeClient, async (req, res) => {
    const { taskId } = req.params;
    const clientId = req.user.UserID;
    const { newStatus } = req.body;

    // Validate the new status to ensure it's a value we allow
    const allowedStatuses = ['Open', 'Filled', 'Closed', 'Completed', 'In Progress'];
    if (!newStatus || !allowedStatuses.includes(newStatus)) {
        return res.status(400).json({ message: 'Invalid or missing new status provided.' });
    }

    try {
        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        if (task.ClientID !== clientId) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to update this task.' });
        }

        task.TaskStatus = newStatus;
        const updatedTask = await task.save();
        res.status(200).json({ message: `Task status updated to '${newStatus}'.`, task: updatedTask });

    } catch (error) {
        console.error('Update Task Status Error:', error);
        res.status(500).json({ message: 'Server error while updating task status.', error: error.message });
    }
});


// --- Public Task Viewing Routes ---

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
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM TaskApplications AS ta
                            WHERE
                                ta.Task_ID = Task.TaskID AND
                                ta.Status IN ('Pending', 'ViewedByAdmin', 'Shortlisted', 'Approved', 'InProgress', 'SubmittedForReview')
                        )`),
                        'applicantCount'
                    ]
                ]
            },
            limit,
            offset,
            order: [['PostedDate', 'DESC']]
        });

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
        const task = await Task.findByPk(taskId);
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