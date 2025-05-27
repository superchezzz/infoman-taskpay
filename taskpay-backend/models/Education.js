const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
// Applicant model will be imported after its definition for association, or use string literal 'Applicant'

class Education extends Model {}

Education.init({
    EducationEntryID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Applicant_ID: { // Foreign Key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Applicants', // Target table name
            key: 'Applicant_ID'
        }
    },
    Educ_Level: {
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
    Yr_Grad: {
        type: DataTypes.STRING(20), // Year Graduated
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Education',
    tableName: 'EDUCATION',
    timestamps: true, 
    // Ensures an applicant doesn't list the exact same degree from the same school/course multiple times.
    indexes: [
        {
            unique: true,
            fields: ['Applicant_ID', 'Educ_Level', 'School', 'Course']
        }
    ]
});

module.exports = Education;