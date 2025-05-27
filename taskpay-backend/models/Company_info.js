const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class CompanyInformation extends Model {}

CompanyInformation.init({
    CompanyInfo_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Cmp_Name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true // Assuming company names are unique
    },
    Cmp_Address: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'CompanyInformation',
    tableName: 'COMPANY_INFORMATION',
    timestamps: true
});

module.exports = CompanyInformation;