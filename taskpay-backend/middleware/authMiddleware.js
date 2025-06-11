/**
 * @file authMiddleware.js
 * @description Middleware for authentication (verifying JWT) and authorization (checking roles).
 *
 * @modification
 * - Added a generic `authorize` function to reduce code repetition.
 * - Added the required `authorizeApplicant` middleware.
 * - Improved the `protect` function to efficiently load user roles with the user object.
 */

const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
// dotenv config is usually only needed in the main server file, but leaving it for safety.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });


// 'protect' middleware verifies the token and attaches the user with their roles
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

            // --- IMPROVEMENT ---
            // Fetch the user AND their associated roles in a single query.
            // This is more efficient than calling user.getRoles() in every authorization middleware.
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['PasswordHash'] },
                include: [{
                    model: Role,
                    as: 'Roles',
                    attributes: ['RoleName'] // We only need the role names
                }]
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

/**
 * @function authorize
 * @description Generic authorization middleware generator.
 * @param {...string} allowedRoles - A list of role names that are allowed access.
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // The `protect` middleware should have already attached req.user with Roles
        if (!req.user || !req.user.Roles) {
            return res.status(401).json({ message: 'Not authorized, user data is incomplete.' });
        }

        const hasRole = req.user.Roles.some(role => allowedRoles.includes(role.RoleName));

        if (hasRole) {
            next(); // User has a required role, proceed
        } else {
            res.status(403).json({ message: 'Forbidden: You do not have the required permissions to access this resource.' });
        }
    };
};

// Create specific middleware functions using the generic generator for consistency
const authorizeAdmin = authorize('admin');
const authorizeClient = authorize('client');
const authorizeApplicant = authorize('applicant'); // This is the new function we needed


module.exports = {
    protect,
    authorize, // Exporting the generator is good practice
    authorizeAdmin,
    authorizeClient,
    authorizeApplicant // Now we export the applicant authorizer
};