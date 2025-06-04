const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Import models from the central db object
const { User, Applicant, Role, UserRole } = require('../models'); // This now points to models/index.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// ... (rest of your authRoutes.js code remains the same, as it uses User, Applicant, Role, UserRole) ...
// Make sure the generateToken, /register, and /login routes are here.
// The code for generateToken, router.post('/register', ...), and router.post('/login', ...)
// from the previous "Phase 2: Refactor authRoutes.js" step should be here.
// I'll paste the full authRoutes.js again for clarity in the next step if needed.
// For now, the key change is the import line above.

// --- Helper function to generate JWT ---
const generateToken = (userId, activeRole) => {
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
        throw new Error('JWT Secret not configured');
    }
    return jwt.sign({ id: userId, role: activeRole }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// --- User Registration ---
router.post('/register', async (req, res) => {
    const { Email, Password, Surname, First_Name, Middle_Name, Suffix, PhoneNumber, selectedRole } = req.body;
    if (!Email || !Password || !Surname || !First_Name || !selectedRole) {
        return res.status(400).json({ message: 'Please provide Email, Password, Surname, First Name, and select a Role.' });
    }
    if (Password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    if (!['applicant', 'client', 'admin'].includes(selectedRole)) {
        return res.status(400).json({ message: 'Invalid role selected.' });
    }
    try {
        const userExists = await User.findOne({ where: { Email } });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        const roleInstance = await Role.findOne({ where: { RoleName: selectedRole } });
        if (!roleInstance) {
            return res.status(500).json({ message: `Role '${selectedRole}' not found.` });
        }
        const newUser = await User.create({ Email, PasswordHash: Password });
        await UserRole.create({ UserID: newUser.UserID, RoleID: roleInstance.RoleID });
        if (selectedRole === 'applicant') {
            await Applicant.create({
                Applicant_ID: newUser.UserID, Surname, First_Name, Middle_Name: Middle_Name || null,
                Suffix: Suffix || null, Phone_Num: PhoneNumber || null
            });
        }
        res.status(201).json({
            UserID: newUser.UserID, Email: newUser.Email, activeRole: selectedRole,
            token: generateToken(newUser.UserID, selectedRole),
            message: `User registered successfully as ${selectedRole}.`
        });
    } catch (error) {
        console.error('Registration Error:', error);
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ message: 'Validation Error.', errors: messages });
        }
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// --- User Login ---
router.post('/login', async (req, res) => {
    const { Email, Password, loginRole } = req.body;
    if (!Email || !Password || !loginRole) {
        return res.status(400).json({ message: 'Please provide Email, Password, and Role.' });
    }
    if (!['applicant', 'client', 'admin'].includes(loginRole)) {
        return res.status(400).json({ message: 'Invalid login role.' });
    }
    try {
        const user = await User.findOne({ where: { Email } });
        if (!user || !(await user.isValidPassword(Password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const userRoles = await user.getRoles({ where: { RoleName: loginRole } }); // Uses alias 'Roles'
        if (!userRoles || userRoles.length === 0) {
            return res.status(403).json({ message: `Access denied. User does not have the '${loginRole}' role.` });
        }
        res.json({
            UserID: user.UserID, Email: user.Email, activeRole: loginRole,
            token: generateToken(user.UserID, loginRole),
            message: `Login successful as ${loginRole}.`
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

module.exports = router;