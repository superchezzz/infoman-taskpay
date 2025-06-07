/**
 * @file authMiddleware.js
 * @description Middleware for authentication (verifying JWT) and authorization (checking roles).
 *
 * @modification
 * Added the 'authorizeClient' middleware function to check if the authenticated user
 * possesses the 'client' role. This will be used to protect client-specific endpoints.
 */

const jwt = require('jsonwebtoken');
const { User, Role } = require('../models'); // Updated to use centralized model imports
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });


// 'protect' middleware remains the same, it verifies the token and attaches the user
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not defined. Cannot verify token.');
                return res.status(500).json({ message: 'Server configuration error: JWT secret missing.' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['PasswordHash'] }
            });

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found for this token.' });
            }
            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed verification.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};

// 'authorizeAdmin' middleware remains the same
const authorizeAdmin = async (req, res, next) => {
    if (req.user) {
        try {
            const roles = await req.user.getRoles();
            const isAdmin = roles.some(role => role.RoleName === 'admin');

            if (isAdmin) {
                next();
            } else {
                res.status(403).json({ message: 'Forbidden: Not authorized as an admin.' });
            }
        } catch (error) {
            console.error("Admin authorization error:", error);
            res.status(500).json({ message: "Server error during admin authorization." });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, user not identified.' });
    }
};

/**
 * @function authorizeClient
 * @description Middleware to authorize client users.
 * Should be used AFTER the 'protect' middleware.
 */
const authorizeClient = async (req, res, next) => {
    if (req.user) {
        try {
            // Get all roles associated with the authenticated user
            const roles = await req.user.getRoles();
            // Check if one of the roles is 'client'
            const isClient = roles.some(role => role.RoleName === 'client');

            if (isClient) {
                next(); // User has the client role, proceed
            } else {
                res.status(403).json({ message: 'Forbidden: Not authorized as a client.' });
            }
        } catch (error) {
            console.error("Client authorization error:", error);
            res.status(500).json({ message: "Server error during client authorization." });
        }
    } else {
        // This case should be caught by 'protect' middleware first
        res.status(401).json({ message: 'Not authorized, user not identified.' });
    }
};


module.exports = { protect, authorizeAdmin, authorizeClient };