const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
    class User extends sequelize.Sequelize.Model {
        async isValidPassword(password) {
            return bcrypt.compare(password, this.PasswordHash);
        }
        static associate(models) {
            User.belongsToMany(models.Role, {
                through: models.UserRole,
                foreignKey: 'UserID',
                otherKey: 'RoleID',
                as: 'Roles'
            });
            User.hasOne(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'ApplicantProfile',
                onDelete: 'CASCADE'
            });
            User.hasMany(models.TaskApplication, {
                foreignKey: 'Applicant_ID',
                as: 'Applications'
            });
        }
    }
    User.init({
        UserID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        Email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        PasswordHash: { type: DataTypes.STRING(255), allowNull: false }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: false // Corrected
    });
    const hashPassword = async (user) => {
        if (user.changed('PasswordHash') || user.isNewRecord) {
            const salt = await bcrypt.genSalt(10);
            user.PasswordHash = await bcrypt.hash(user.PasswordHash, salt);
        }
    };
    User.beforeCreate(hashPassword);
    User.beforeUpdate(hashPassword);
    return User;
};