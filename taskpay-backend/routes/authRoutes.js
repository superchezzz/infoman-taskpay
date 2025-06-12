// authRoutes.js (UPDATED with Transactions and ClientProfile creation)
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Import models from the central db object, including the Sequelize instance
const db = require('../models'); // Import the whole db object
const User = db.User;
const Applicant = db.Applicant;
const Role = db.Role;
const UserRole = db.UserRole;
const ClientProfile = db.ClientProfile; // <-- NEW: Import ClientProfile

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

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
    // Destructure required fields from request body
    const { Email, Password, Surname, First_Name, Middle_Name, Suffix, PhoneNumber, selectedRole } = req.body;

    // Start a Sequelize transaction
    const t = await db.sequelize.transaction(); // Get the sequelize instance from db object

    try {
        // Basic validation before database operations
        if (!Email || !Password || !Surname || !First_Name || !selectedRole) {
            await t.rollback(); // Rollback if validation fails
            return res.status(400).json({ message: 'Please provide Email, Password, Surname, First Name, and select a Role.' });
        }
        if (Password.length < 6) {
            await t.rollback(); // Rollback if validation fails
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }
        if (!['applicant', 'client', 'admin'].includes(selectedRole)) {
            await t.rollback(); // Rollback if validation fails
            return res.status(400).json({ message: 'Invalid role selected.' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ where: { Email }, transaction: t }); // Pass transaction
        if (userExists) {
            await t.rollback(); // Rollback if user exists
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Find the role instance
        const roleInstance = await Role.findOne({ where: { RoleName: selectedRole }, transaction: t }); // Pass transaction
        if (!roleInstance) {
            await t.rollback(); // Rollback if role not found
            return res.status(500).json({ message: `Role '${selectedRole}' not found.` });
        }

        // 1. Create User
        const newUser = await User.create({ Email, PasswordHash: Password }, { transaction: t }); // Pass transaction

        // 2. Assign Role to User
        await UserRole.create({ UserID: newUser.UserID, RoleID: roleInstance.RoleID }, { transaction: t }); // Pass transaction

        // 3. Create User Profile based on role
        if (selectedRole === 'applicant') {
            await Applicant.create({
                Applicant_ID: newUser.UserID, // Matches UserID
                Surname,
                First_Name,
                Middle_Name: Middle_Name || null,
                Suffix: Suffix || null,
                Phone_Num: PhoneNumber || null
                // ... other required applicant fields from req.body
            }, { transaction: t }); // Pass transaction
        } else if (selectedRole === 'client') {
            // NEW: Create ClientProfile for client users
            const CompanyName = req.body.CompanyName || null; // Assuming CompanyName is also sent in req.body for clients
            await ClientProfile.create({
                UserID: newUser.UserID, // Matches UserID
                First_Name,
                Surname,
                CompanyName,
                // ... other optional client profile fields if collected during signup
            }, { transaction: t }); // Pass transaction
        }
        // You can add an 'else if (selectedRole === 'admin') { ... }' if admins have a separate profile

        // If all operations succeed, commit the transaction
        await t.commit();

        // Generate token and send response
        res.status(201).json({
            UserID: newUser.UserID,
            Email: newUser.Email,
            activeRole: selectedRole,
            token: generateToken(newUser.UserID, selectedRole),
            message: `User registered successfully as ${selectedRole}.`
        });

    } catch (error) {
        // If any error occurs, rollback the transaction
        await t.rollback();
        console.error('Registration Error:', error);

        // Handle specific Sequelize errors for better feedback
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Email already registered.' });
        } else if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ message: 'Validation Error.', errors: messages });
        }
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// --- User Login (No changes needed here for now) ---
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