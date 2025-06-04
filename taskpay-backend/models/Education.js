const { Model } = require('sequelize'); // Import Model directly from the sequelize library

module.exports = (sequelize, DataTypes) => { // sequelize instance is still passed for init
    class Education extends Model { // Extend the imported Model
        static associate(models) {
            Education.belongsTo(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'Applicant'
            });
        }
    }

    Education.init({
        EducationEntryID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Applicant_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'APPLICANT', // Table name for raw reference
                key: 'Applicant_ID'
            }
        },
        Educ_Level: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        School: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Course: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Awards: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        Yr_Grad: {
            type: DataTypes.STRING(20),
            allowNull: true
        }
    }, {
        sequelize, // Pass the sequelize instance here for init
        modelName: 'Education',
        tableName: 'EDUCATION',
        timestamps: true,
        indexes: [{
            unique: true,
            fields: ['Applicant_ID', 'Educ_Level', 'School', 'Course']
        }]
    });

    return Education;
};