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
                foreignKey: 'Applicant_ID', // Applicant_ID in applicants table refers to UserID
                as: 'ApplicantProfile',
                onDelete: 'CASCADE'
            });
            // THIS IS THE NEW ASSOCIATION FOR ClientProfile
            User.hasOne(models.ClientProfile, {
                foreignKey: 'UserID', // ClientProfile's primary key is UserID
                as: 'ClientProfile',
                onDelete: 'CASCADE'
            });
            User.hasMany(models.TaskApplication, {
                foreignKey: 'Applicant_ID', // Applicant_ID in task_applications table refers to UserID
                as: 'Applications'
            });
            User.hasMany(models.Task, {
                foreignKey: 'ClientID', // ClientID in tasks table refers to UserID
                as: 'PostedTasks'
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
        tableName: 'users', // Ensure this matches the renamed table
        timestamps: true,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt',
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