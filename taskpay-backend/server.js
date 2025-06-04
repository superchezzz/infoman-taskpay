require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/database'); // connectDB just authenticates
const db = require('./models'); // This loads all models and sets up associations via models/index.js

// Route imports
const authRoutes = require('./routes/authRoutes');
const applicantProfileRoutes = require('./routes/applicantProfileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Middleware imports
const { protect } = require('./middleware/authMiddleware'); // This will also need to import User from db

const app = express();
const port = process.env.PORT || 3001;

// Connect to Database
connectDB();
// Optional: Sync database (useful in dev, use migrations in prod)
// db.sequelize.sync({ alter: true }).then(() => console.log('Database synced.'));


// ... (rest of server.js remains largely the same) ...
// Just ensure all route files now import models from `db` (i.e., `require('../models')`)

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.get('/', (req, res) => res.send('TaskPay API Welcome'));
app.get('/api', (req, res) => res.send('TaskPay API Backend'));
app.use('/api/auth', authRoutes);
app.use('/api/profile', protect, applicantProfileRoutes); // protect will need updated User model import
app.use('/api/admin', adminRoutes); // adminRoutes will need updated model imports
app.use('/api/tasks', taskRoutes); // taskRoutes will need updated model imports
app.use('/api/applications', protect, applicationRoutes); // applicationRoutes will need updated model imports

// Centralized Error Handling
app.use((err, req, res, next) => { /* ... */ });

app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});