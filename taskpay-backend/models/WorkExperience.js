module.exports = (sequelize, DataTypes) => {
    class WorkExperience extends sequelize.Sequelize.Model {
        static associate(models) {
            // WorkExperience belongs to an Applicant
            WorkExperience.belongsTo(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'Applicant'
            });

            // WorkExperience belongs to a CompanyInformation entry
            WorkExperience.belongsTo(models.CompanyInformation, {
                foreignKey: 'CompanyInfo_ID',
                as: 'CompanyDetails' // Changed alias for clarity
            });
        }
    }

    WorkExperience.init({
        WorkExperienceID: {
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
        CompanyInfo_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'COMPANY_INFORMATION', // Table name
                key: 'CompanyInfo_ID'
            }
        },
        Cmp_Name_Manual: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Cmp_Address_Manual: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        inclusive_date_from: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        inclusive_date_to: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        Position: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Status: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'WorkExperience',
        tableName: 'WORK_EXPERIENCE',
        timestamps: true // Or false if you added columns manually
    });

    return WorkExperience;
};