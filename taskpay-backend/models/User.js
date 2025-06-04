const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    class User extends sequelize.Sequelize.Model { // Use sequelize.Sequelize.Model
        async isValidPassword(password) {
            return bcrypt.compare(password, this.PasswordHash);
        }

        static associate(models) {
            // Define associations here
            // User has many Roles through UserRoles
            User.belongsToMany(models.Role, {
                through: models.UserRole,
                foreignKey: 'UserID',
                otherKey: 'RoleID',
                as: 'Roles'
            });

            // User has one Applicant profile
            User.hasOne(models.Applicant, {
                foreignKey: 'Applicant_ID',
                as: 'ApplicantProfile',
                onDelete: 'CASCADE'
            });

            // User (as applicant) has many TaskApplications
            User.hasMany(models.TaskApplication, {
                foreignKey: 'Applicant_ID',
                as: 'Applications' // User's applications for tasks
            });

            // If Users can also post tasks (as clients/admins) - for future
            // User.hasMany(models.Task, {
            //     foreignKey: 'ClientID', // Assuming ClientID in Task model refers to UserID
            //     as: 'PostedTasks'
            // });
        }
    }

    User.init({
        UserID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        PasswordHash: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
        // Role column was removed
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: true
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