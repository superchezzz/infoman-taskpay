module.exports = (sequelize, DataTypes) => {
    class Attachment extends sequelize.Sequelize.Model {
        static associate(models) {
            Attachment.belongsTo(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'Applicant' // Optional alias
            });
        }
    }

    Attachment.init({
        AttachmentID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Applicant_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'APPLICANT', // Table name
                key: 'Applicant_ID'
            }
        },
        FileName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        FilePath: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        FileType: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        FileSize: {
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
        tableName: 'attachments',
        timestamps: false // Using manual UploadedAt
    });

    return Attachment;
};