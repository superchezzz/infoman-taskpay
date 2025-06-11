'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class JobCategory extends Model {
        static associate(models) {
            // A Job Category can belong to many Applicants through the join table
            JobCategory.belongsToMany(models.Applicant, {
                through: 'Applicant_JobCategory_Preferences',
                foreignKey: 'CategoryID',
                otherKey: 'ApplicantID',
                as: 'Applicants'
            });
        }
    }
    JobCategory.init({
        CategoryID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        CategoryName: { type: DataTypes.STRING, allowNull: false, unique: true }
    }, {
        sequelize,
        modelName: 'JobCategory',
        tableName: 'JobCategories',
        timestamps: false
    });
    return JobCategory;
};