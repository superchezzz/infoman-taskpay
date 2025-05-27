const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Attachment extends Model {}

Attachment.init({
    AttachmentID: {
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
    FileName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    FilePath: { // Path where the file is stored or cloud URL
        type: DataTypes.STRING(512),
        allowNull: false
    },
    FileType: { // e.g., 'application/pdf', 'image/jpeg'
        type: DataTypes.STRING(100),
        allowNull: true
    },
    FileSize: { // Size in bytes
        type: DataTypes.INTEGER,
        allowNull: true
    },
    UploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Attachment',
    tableName: 'ATTACHMENTS',
    timestamps: false // UploadedAt is manually handled, or set to true if we want createdAt/updatedAt
});

module.exports = Attachment;