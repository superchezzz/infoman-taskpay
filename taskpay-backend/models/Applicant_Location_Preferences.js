'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Applicant_Location_Preferences extends Model {}
  Applicant_Location_Preferences.init({
    ApplicantID: { type: DataTypes.INTEGER, primaryKey: true },
    LocationID: { type: DataTypes.INTEGER, primaryKey: true }
  }, {
    sequelize,
    modelName: 'Applicant_Location_Preferences',
    tableName: 'applicant_location_preferences',
    timestamps: false
  });
  return Applicant_Location_Preferences;
};