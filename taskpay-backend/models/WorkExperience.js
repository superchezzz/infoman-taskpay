module.exports = (sequelize, DataTypes) => {
    class WorkExperience extends sequelize.Sequelize.Model {
        static associate(models) {
            WorkExperience.belongsTo(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'Applicant'
            });
            WorkExperience.belongsTo(models.CompanyInformation, {
                foreignKey: 'CompanyInfo_ID',
                as: 'CompanyDetails'
            });
        }
    }

    WorkExperience.init({
        WorkExperienceID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        Applicant_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'APPLICANT', key: 'Applicant_ID' }
        },
        CompanyInfo_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'COMPANY_INFORMATION', key: 'CompanyInfo_ID' }
        },
        // Removed Cmp_Name_Manual and Cmp_Address_Manual
        inclusive_date_from: { type: DataTypes.DATEONLY, allowNull: true },
        inclusive_date_to: { type: DataTypes.DATEONLY, allowNull: true },
        Position: { type: DataTypes.STRING(255), allowNull: true },
        Status: { type: DataTypes.STRING(100), allowNull: true },
        Responsibilities: { type: DataTypes.TEXT, allowNull: true }
    }, {
        sequelize,
        modelName: 'WorkExperience',
        tableName: 'WORK_EXPERIENCE',
        // Removed timestamps
        timestamps: false
    });

    return WorkExperience;
};