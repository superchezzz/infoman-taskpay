'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Applicant_JobCategory_Preferences extends Model {}
  Applicant_JobCategory_Preferences.init({
    ApplicantID: { type: DataTypes.INTEGER, primaryKey: true },
    CategoryID: { type: DataTypes.INTEGER, primaryKey: true }
  }, {
    sequelize,
    modelName: 'Applicant_JobCategory_Preferences',
    tableName: 'Applicant_JobCategory_Preferences',
    timestamps: false
  });
  return Applicant_JobCategory_Preferences;
};