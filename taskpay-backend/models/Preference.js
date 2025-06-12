'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Preference extends Model {
        static associate(models) {
            Preference.belongsTo(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'Applicant'
            });
        }
    }
    Preference.init({
        PreferenceEntryID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        Applicant_ID: { type: DataTypes.INTEGER, allowNull: false, unique: true },
        Exp_Salary_Min: DataTypes.DECIMAL(12, 2),
        Exp_Salary_Max: DataTypes.DECIMAL(12, 2)
    }, {
        sequelize,
        modelName: 'Preference',
        tableName: 'preferences',
        timestamps: false,
    });
    return Preference;
};