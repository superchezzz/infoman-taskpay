'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Applicant extends Model {
        static associate(models) {
            // An Applicant is a type of User
            Applicant.belongsTo(models.User, {
                foreignKey: 'Applicant_ID',
                as: 'UserAccountDetails'
            });

            // An Applicant has many educational entries, work experiences, etc.
            Applicant.hasMany(models.Education, { foreignKey: 'Applicant_ID', as: 'Educations' });
            Applicant.hasMany(models.WorkExperience, { foreignKey: 'Applicant_ID', as: 'WorkExperiences' });
            Applicant.hasMany(models.Certification, { foreignKey: 'Applicant_ID', as: 'Certifications' });
            Applicant.hasMany(models.Attachment, { foreignKey: 'Applicant_ID', as: 'Attachments' });
            
            // --- NEW AND CORRECTED ASSOCIATIONS ---
            // An Applicant has one set of Preferences (for salary)
            Applicant.hasOne(models.Preference, { foreignKey: 'Applicant_ID', as: 'Preferences' });

            // An Applicant can have many preferred Job Categories through the join table
            Applicant.belongsToMany(models.JobCategory, {
                through: 'Applicant_JobCategory_Preferences',
                foreignKey: 'ApplicantID',
                otherKey: 'CategoryID',
                as: 'JobCategories'
            });

            // An Applicant can have many preferred Locations through the join table
            Applicant.belongsToMany(models.Location, {
                through: 'Applicant_Location_Preferences',
                foreignKey: 'ApplicantID',
                otherKey: 'LocationID',
                as: 'Locations'
            });
        }
    }
    Applicant.init({
        Applicant_ID: { type: DataTypes.INTEGER, primaryKey: true },
        Surname: { type: DataTypes.STRING, allowNull: false },
        First_Name: { type: DataTypes.STRING, allowNull: false },
        Middle_Name: DataTypes.STRING,
        Suffix: DataTypes.STRING,
        Age: DataTypes.INTEGER,
        Sex: DataTypes.STRING,
        Civil_Status: DataTypes.STRING,
        DOB: DataTypes.DATE,
        Place_of_Birth: DataTypes.STRING,
        HouseNum_Street: DataTypes.STRING,
        Brgy: DataTypes.STRING,
        City: DataTypes.STRING,
        Province: DataTypes.STRING,
        TIN_No: DataTypes.STRING,
        SSS_No: DataTypes.STRING,
        Philhealth_No: DataTypes.STRING,
        Phone_Num: DataTypes.STRING,
        Disability: DataTypes.STRING,
        Emp_Status: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Applicant',
        tableName: 'APPLICANT',
        timestamps: true, // Assuming your table has CreatedAt and UpdatedAt
        updatedAt: 'UpdatedAt',
        createdAt: 'CreatedAt',
    });
    return Applicant;
};