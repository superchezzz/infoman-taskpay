require('dotenv').config(); // Load environment variables from .env file
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: console.log, // Log SQL queries to the console (remove or set to false in production)
        pool: { // Optional: connection pooling parameters
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connection has been established successfully via Sequelize.');
        // await sequelize.sync({ alter: true }); // or { force: true } to drop and recreate (DANGEROUS)
        // console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error('Unable to connect to the database via Sequelize:', error);
        process.exit(1); // Exit process with failure if DB connection fails
    }
};

module.exports = { sequelize, connectDB };