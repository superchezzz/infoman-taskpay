'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize'); // Import Sequelize and DataTypes
const { sequelize } = require('../config/database'); // Your existing Sequelize instance

const db = {};

// Read all files in the current directory (models) excluding this index.js file
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== path.basename(__filename) && // Exclude this index.js file
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Import the model definition function
    // Each model file should export a function that accepts (sequelize, DataTypes)
    // and returns the model.
    const modelDefinition = require(path.join(__dirname, file));
    const model = modelDefinition(sequelize, DataTypes); // Initialize model
    db[model.name] = model; // Add model to the db object, keyed by its name
  });

// Call associate method on each model if it exists
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // Pass all models to the associate method
  }
});

db.sequelize = sequelize; // The configured Sequelize instance
db.Sequelize = Sequelize; // The Sequelize library itself

module.exports = db; // Export all models and sequelize instance