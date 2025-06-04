module.exports = (sequelize, DataTypes) => {
    class UserRole extends sequelize.Sequelize.Model {
        static associate(models) {
            // Explicitly define belongsTo if you want to easily navigate from UserRole
            UserRole.belongsTo(models.User, { foreignKey: 'UserID' });
            UserRole.belongsTo(models.Role, { foreignKey: 'RoleID' });
        }
    }

    UserRole.init({
        UserRoleID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        UserID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { // References are still good to keep for schema integrity
                model: 'Users', // Table name
                key: 'UserID'
            }
        },
        RoleID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Roles', // Table name
                key: 'RoleID'
            }
        }
    }, {
        sequelize,
        modelName: 'UserRole',
        tableName: 'UserRoles',
        timestamps: true
    });

    return UserRole;
};