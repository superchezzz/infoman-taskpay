module.exports = (sequelize, DataTypes) => {
    class CompanyInformation extends sequelize.Sequelize.Model {
        static associate(models) {
            CompanyInformation.hasMany(models.WorkExperience, {
                foreignKey: 'CompanyInfo_ID',
                as: 'WorkExperiencesAtCompany',
                onDelete: 'SET NULL'
            });
        }
    }
    CompanyInformation.init({
        CompanyInfo_ID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        Cmp_Name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        Cmp_Address: { type: DataTypes.TEXT, allowNull: true }
    }, {
        sequelize,
        modelName: 'CompanyInformation',
        tableName: 'company_information',
        timestamps: false // Corrected
    });
    return CompanyInformation;
};