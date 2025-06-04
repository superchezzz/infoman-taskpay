module.exports = (sequelize, DataTypes) => {
    class Certification extends sequelize.Sequelize.Model {
        static associate(models) {
            // Certification belongs to an Applicant
            Certification.belongsTo(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'Applicant' // Matches the alias used in Applicant.hasMany
            });
        }
    }

    Certification.init({
        CertificationEntryID: {
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
        Certifications: {
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
        timestamps: true, // Or false if you added columns manually and don't want Sequelize to manage them
        indexes: [
            {
                unique: true,
                fields: ['Applicant_ID', 'Certifications', 'Issuing_Organization']
            }
        ]
    });

    return Certification;
};