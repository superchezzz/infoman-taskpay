const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Preference extends Model {}

Preference.init({
    PreferenceEntryID: {
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
    Pref_Occupation: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Pref_Location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Exp_Salary: { 
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Preference',
    tableName: 'PREFERENCE',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['Applicant_ID', 'Pref_Occupation', 'Pref_Location']
        }
    ]
});

module.exports = Preference;