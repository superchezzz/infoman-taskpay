/**
 * @file server.js
 * @description Main entry point for the TaskPay backend Express server.
 *
 * @description
 * This file initializes the Express application, connects to the database,
 * sets up core middleware (including CORS), mounts all API route handlers,
 * and starts the server.
 *
 * @modification
 * Added and mounted the new 'clientRoutes.js' to handle API endpoints
 * specific to the 'client' user role, such as viewing posted tasks.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const db = require('./models');

// Route imports
const authRoutes = require('./routes/authRoutes');
const applicantProfileRoutes = require('./routes/applicantProfileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const fileUploadRoutes = require('./routes/fileUploadRoutes');
const clientRoutes = require('./routes/clientRoutes');
const lookupRoutes = require('./routes/lookupRoutes');

// Middleware imports
const { protect } = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

// --- Connect to Database ---
connectDB();

// --- Core Middleware ---

// Define the list of allowed origins (domains)
const allowedOrigins = [
    'https://taskpay-ten.vercel.app', // The deployed Vercel frontend
    'http://localhost:5173',          // The local development frontend (Corrected Port)
    'http://localhost:5174'           // Keeping this in case it switches back
];

// Configure CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like Postman, mobile apps, or server-to-server requests)
        // or if the origin is in our whitelist.
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

// Enable CORS with our specific options.
app.use(cors(corsOptions));
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded bodies

// --- API Routes ---

app.get('/', (req, res) => {
    res.send('Welcome to the TaskPay API! Awaiting requests...');
});

// Mount all API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', protect, applicantProfileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/applications', protect, applicationRoutes);
app.use('/api/uploads', protect, fileUploadRoutes); 
app.use('/api/clients', clientRoutes); 
app.use('/api/lookups', lookupRoutes);

// --- Centralized Error Handling ---
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err);
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: 'This origin is not allowed to access resources.' });
    }
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: err.message || 'An unexpected error occurred.',
    });
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});