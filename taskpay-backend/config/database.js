require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: console.log, // Or false
        pool: { /* ... */ }
    }
);

// The connectDB function just authenticates now.
// Model loading and association happens via models/index.js
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connection has been established successfully via Sequelize.');
    } catch (error) {
        console.error('Unable to connect to the database via Sequelize:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB }; // Export sequelize instance