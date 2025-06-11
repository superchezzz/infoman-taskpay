// models/Education.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Education extends Model {
        static associate(models) {
            Education.belongsTo(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'Educations' // Corrected alias to match other models
            });
        }
    }

    Education.init({
        EducationEntryID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Applicant_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'APPLICANT', // Ensure this table name is correct
                key: 'Applicant_ID'
            }
        },
        Education_Level: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        School: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Course: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Awards: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // --- THIS IS THE FIX ---
        // The YEAR data type in MySQL is represented by INTEGER in Sequelize.
        Yr_Grad: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Education',
        tableName: 'EDUCATION',
        timestamps: false, // We confirmed this is desired
        indexes: [
            {
                unique: true,
                fields: ['Applicant_ID', 'Education_Level', 'School', 'Course']
            }
        ]
    });

    return Education;
};