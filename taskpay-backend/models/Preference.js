module.exports = (sequelize, DataTypes) => {
    class Preference extends sequelize.Sequelize.Model {
        static associate(models) {
            Preference.belongsTo(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'Applicant'
            });
        }
    }

    Preference.init({
        PreferenceEntryID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        Applicant_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // The unique constraint is on Applicant_ID alone
            references: { model: 'APPLICANT', key: 'Applicant_ID' }
        },
        // Removed Pref_Occupation and Pref_Location as they are not in the schema table
        Exp_Salary_Min: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        Exp_Salary_Max: { type: DataTypes.DECIMAL(12, 2), allowNull: true }
    }, {
        sequelize,
        modelName: 'Preference',
        tableName: 'PREFERENCE',
        // Removed timestamps
        timestamps: false
        // Removed incorrect index
    });

    return Preference;
};