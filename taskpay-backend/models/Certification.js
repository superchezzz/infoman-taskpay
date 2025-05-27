const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Certification extends Model {}

Certification.init({
    CertificationEntryID: {
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
    Certifications: { // Name of the certification
        type: DataTypes.STRING(255),
        allowNull: false
    },
    course_date_from: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    course_date_to: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Issuing_Organization: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Certification_Level: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Training_Duration: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Certification',
    tableName: 'CERTIFICATION',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['Applicant_ID', 'Certifications', 'Issuing_Organization']
        }
    ]
});

module.exports = Certification;