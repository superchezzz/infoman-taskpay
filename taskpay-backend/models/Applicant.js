const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); // Existing import

// Import all newly created models for associations
const Education = require('./Education');
const Certification = require('./Certification');
const WorkExperience = require('./WorkExperience');
const Preference = require('./Preference');
const Attachment = require('./Attachment');
const CompanyInformation = require('./CompanyInformation'); // Needed if WorkExperience refers to it

class Applicant extends Model {}

Applicant.init({
    Applicant_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'UserID'
        }
    },
    Surname: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    First_Name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Middle_Name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Suffix: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Sex: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    Civil_Status: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    DOB: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Place_of_Birth: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    House_No: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Street: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Brgy: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    City: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Province: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    TIN_No: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    SSS_No: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Philhealth_No: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Landline: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Phone_Num: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Disability: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Emp_Status: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Applicant',
    tableName: 'APPLICANT',
    timestamps: true
});

// --- Define Associations ---
User.hasOne(Applicant, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'ApplicantProfile' }); // Added alias
Applicant.belongsTo(User, { foreignKey: 'Applicant_ID', as: 'UserDetails' }); // Added alias

Applicant.hasMany(Education, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', as: 'Educations' });
Education.belongsTo(Applicant, { foreignKey: 'Applicant_ID', as: 'Applicant' });

Applicant.hasMany(Certification, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', as: 'Certifications' });
Certification.belongsTo(Applicant, { foreignKey: 'Applicant_ID', as: 'Applicant' });

Applicant.hasMany(Work_exp, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', as: 'WorkExperiences' });
Work_exp.belongsTo(Applicant, { foreignKey: 'Applicant_ID', as: 'Applicant' });

// WorkExperience to CompanyInformation
CompanyInformation.hasMany(Work_exp, { foreignKey: 'CompanyInfo_ID', onDelete: 'SET NULL', as: 'WorkExperiences' });
Work_exp.belongsTo(CompanyInformation, { foreignKey: 'CompanyInfo_ID', as: 'CompanyInformation' }); // 'as' must match include

Applicant.hasMany(Preference, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', as: 'Preferences' });
Preference.belongsTo(Applicant, { foreignKey: 'Applicant_ID', as: 'Applicant' });

// Applicant.hasMany(Attachment, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', as: 'Attachments' });
// Attachment.belongsTo(Applicant, { foreignKey: 'Applicant_ID', as: 'Applicant' });

module.exports = Applicant; 