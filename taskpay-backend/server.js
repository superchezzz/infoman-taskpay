/**
 * @file server.js
 * @description Main entry point for the TaskPay backend Express server.
 * @author andreistvn
 * @date 2025-06-07
 *
 * @description
 * This file initializes the Express application, connects to the database,
 * sets up core middleware (including CORS for cross-origin requests),
 * mounts all API route handlers, and starts the server.
 *
 * @modification
 * Added the 'cors' middleware to allow requests from our deployed frontend on Vercel.
 * This is crucial for the frontend and backend to communicate when they are on different domains.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors'); // 1. Import the cors package
const { connectDB } = require('./config/database');
const db = require('./models');

// Route imports
const authRoutes = require('./routes/authRoutes');
const applicantProfileRoutes = require('./routes/applicantProfileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Middleware imports
const { protect } = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

// --- Connect to Database ---
connectDB();

// --- Core Middleware ---

// 2. Enable CORS
// This must be one of the first pieces of middleware.
// It adds the necessary headers to allow our Vercel frontend to make API requests.
app.use(cors({
    origin: 'https://taskpay-ten.vercel.app' // Allow requests only from our deployed frontend
    // For development, if you were running the frontend locally, you might use:
    // origin: ['https://taskpay-ten.vercel.app', 'http://localhost:5173'] // To allow both
}));


app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded bodies

// --- API Routes ---

// Root and basic API info endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the TaskPay API! Awaiting requests...');
});

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount applicant profile routes (protected for authenticated users)
app.use('/api/profile', protect, applicantProfileRoutes);

// Mount admin routes
app.use('/api/admin', adminRoutes);

// Mount task routes
app.use('/api/tasks', taskRoutes);

// Mount application routes (these are specific to a user's actions, so protect them)
app.use('/api/applications', protect, applicationRoutes);

// --- Centralized Error Handling ---
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: err.message || 'An unexpected error occurred.',
    });
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});