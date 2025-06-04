const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Updated import
// Ensure .env is loaded. The path should be relative to this middleware file.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

/**
 * Middleware to protect routes.
 * Verifies JWT token from Authorization header.
 * If token is valid, attaches user object (excluding password) to req.user.
 * If token is invalid or not present, sends 401 Unauthorized.
 */
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
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Not authorized, token is invalid.' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token has expired.' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed verification.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};

/**
 * Middleware to authorize admin users.
 * Should be used AFTER the 'protect' middleware.
 */
const authorizeAdmin = async (req, res, next) => { // Made async as it might involve DB lookup
    if (req.user) {
        try {
            // Assuming user.getRoles() is available due to User.belongsToMany(Role, { as: 'Roles' })
            const roles = await req.user.getRoles(); // Get roles for the authenticated user
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
        // This case should ideally be caught by 'protect' middleware first
        res.status(401).json({ message: 'Not authorized, user not identified.' });
    }
};

module.exports = { protect, authorizeAdmin };