const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class WorkExperience extends Model {}

WorkExperience.init({
    WorkExperienceID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Applicant_ID: { // Foreign Key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Applicants',
            key: 'Applicant_ID'
        }
    },
    CompanyInfo_ID: { // Foreign Key to COMPANY_INFORMATION
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null if Cmp_Name_Manual is used
        references: {
            model: 'COMPANY_INFORMATION', // Target table name
            key: 'CompanyInfo_ID'
        }
    },
    Cmp_Name_Manual: { // In case company is not in COMPANY_INFORMATION
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Cmp_Address_Manual: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    inclusive_date_from: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    inclusive_date_to: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Position: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Status: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'WorkExperience',
    tableName: 'WORK_EXPERIENCE',
    timestamps: true
});

module.exports = WorkExperience;