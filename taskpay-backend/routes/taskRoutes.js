/**
 * @file taskRoutes.js
 * @description Defines API routes for task-related functionalities.
 *
 * @modification
 * Added the POST / endpoint for creating a new task. This endpoint is protected
 * and can only be accessed by authenticated users with the 'client' role.
 * It handles validation and saves the new task to the database.
 */

const express = require('express');
const router = express.Router();
const { protect, authorizeClient } = require('../middleware/authMiddleware'); // Import new client authorization
const { Task, TaskApplication, User, Sequelize, Applicant } = require('../models'); // Import models
const { Op } = Sequelize;

// @route   POST /api/tasks
// @desc    A logged-in client creates a new task
// @access  Private (Client only)
router.post('/', protect, authorizeClient, async (req, res) => {
    // Destructure expected fields from the request body
    const {
        Title,
        Description,
        Budget,
        Category,
        Location,
        Deadline,
        Duration,
    } = req.body;

    // --- Basic Validation ---
    if (!Title || !Description || !Category) {
        return res.status(400).json({ message: 'Please provide a Title, Description, and Category for the task.' });
    }

    try {
        // The user ID is available from the 'protect' middleware
        const clientId = req.user.UserID;

        // Optional: Fetch the client's name from their Applicant profile if they have one,
        // or a future ClientProfile. For now, we can leave ClientName to be set manually
        // or find a default. Let's assume the user object from protect might have the name.
        // For a more robust solution, we'd fetch the user's name from their profile.
        // Let's assume for now ClientName is not automatically populated.
        // The frontend could send it, or we can fetch it. Let's require it from body for now.

        const clientUser = await User.findByPk(clientId, {
            include: {
                model: Applicant,
                as: 'ApplicantProfile',
                attributes: ['First_Name', 'Surname']
            }
        });

        // Construct a client name. Defaults to user email if no profile name exists.
        const clientName = clientUser.ApplicantProfile
            ? `${clientUser.ApplicantProfile.First_Name} ${clientUser.ApplicantProfile.Surname}`
            : clientUser.Email;


        // Create the new task in the database
        const newTask = await Task.create({
            ClientID: clientId, // Link the task to the logged-in client
            ClientName: clientName, // Use the fetched name
            Title,
            Description,
            Budget,
            Category,
            Location,
            Deadline,
            Duration,
            TaskStatus: 'Open' // New tasks are always 'Open' by default
        });

        res.status(201).json({
            message: 'Task created successfully.',
            task: newTask
        });

    } catch (error) {
        console.error('Create Task Error:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Server error while creating task.', error: error.message });
    }
});


// --- Existing Task Viewing Routes ---

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