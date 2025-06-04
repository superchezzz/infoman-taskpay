module.exports = (sequelize, DataTypes) => {
    class Applicant extends sequelize.Sequelize.Model {
        static associate(models) {
            Applicant.belongsTo(models.User, {
                foreignKey: 'Applicant_ID',
                as: 'UserAccountDetails' // Changed from UserDetails for clarity
            });

            Applicant.hasMany(models.Education, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', as: 'Educations' });
            Applicant.hasMany(models.Certification, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', as: 'Certifications' });
            Applicant.hasMany(models.WorkExperience, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', as: 'WorkExperiences' });
            Applicant.hasMany(models.Preference, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', as: 'Preferences' });
            // Applicant.hasMany(models.Attachment, { foreignKey: 'Applicant_ID', onDelete: 'CASCADE', as: 'Attachments' });
        }
    }

    Applicant.init({
        Applicant_ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'Users', // Table name
                key: 'UserID'
            }
        },
        Surname: { type: DataTypes.STRING(255), allowNull: false },
        First_Name: { type: DataTypes.STRING(255), allowNull: false },
        Middle_Name: { type: DataTypes.STRING(255), allowNull: true },
        Suffix: { type: DataTypes.STRING(50), allowNull: true },
        Age: { type: DataTypes.INTEGER, allowNull: true },
        Sex: { type: DataTypes.STRING(20), allowNull: true },
        Civil_Status: { type: DataTypes.STRING(50), allowNull: true },
        DOB: { type: DataTypes.DATEONLY, allowNull: true },
        Place_of_Birth: { type: DataTypes.STRING(255), allowNull: true },
        House_No: { type: DataTypes.STRING(100), allowNull: true },
        Street: { type: DataTypes.STRING(255), allowNull: true },
        Brgy: { type: DataTypes.STRING(255), allowNull: true },
        City: { type: DataTypes.STRING(255), allowNull: true },
        Province: { type: DataTypes.STRING(255), allowNull: true },
        TIN_No: { type: DataTypes.STRING(50), allowNull: true },
        SSS_No: { type: DataTypes.STRING(50), allowNull: true },
        Philhealth_No: { type: DataTypes.STRING(50), allowNull: true },
        Landline: { type: DataTypes.STRING(50), allowNull: true },
        Phone_Num: { type: DataTypes.STRING(50), allowNull: true },
        Disability: { type: DataTypes.STRING(255), allowNull: true },
        Emp_Status: { type: DataTypes.STRING(100), allowNull: true }
    }, {
        sequelize,
        modelName: 'Applicant',
        tableName: 'APPLICANT',
        timestamps: true
    });
    return Applicant;
};