module.exports = (sequelize, DataTypes) => {
    class Preference extends sequelize.Sequelize.Model {
        static associate(models) {
            // Preference belongs to an Applicant
            Preference.belongsTo(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'Applicant'
            });
        }
    }

    Preference.init({
        PreferenceEntryID: {
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
        Pref_Occupation: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Pref_Location: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Exp_Salary_Min: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true
        },
        Exp_Salary_Max: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Preference',
        tableName: 'PREFERENCE',
        timestamps: true, // Or false if you added columns manually
        indexes: [
            {
                unique: true,
                fields: ['Applicant_ID', 'Pref_Occupation', 'Pref_Location']
            }
        ]
    });

    return Preference;
};