// backend/server.js
require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const applicantProfileRoutes = require('./routes/applicantProfileRoutes'); // <-- Import new routes
const { protect } = require('./middleware/authMiddleware'); // protect middleware

const app = express();
const port = process.env.PORT || 3001;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', protect, applicantProfileRoutes); // <-- Mount new routes, protect all of them

app.get('/api', (req, res) => {
    res.send('Hello from the TaskPay API backend!');
});

// Centralized Error Handling
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err);
    res.status(err.status || 500).json({
        message: err.message || 'An unexpected error occurred.',
    });
});

app.listen(port, () => {
    console.log(`Backend server for TaskPay is listening on http://localhost:${port}`);
});