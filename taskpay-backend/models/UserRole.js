module.exports = (sequelize, DataTypes) => {
    class UserRole extends sequelize.Sequelize.Model {
        static associate(models) {
            UserRole.belongsTo(models.User, { foreignKey: 'UserID' });
            UserRole.belongsTo(models.Role, { foreignKey: 'RoleID' });
        }
    }
    UserRole.init({
        UserRoleID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        UserID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'UserID' }
        },
        RoleID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Roles', key: 'RoleID' }
        }
    }, {
        sequelize,
        modelName: 'UserRole',
        tableName: 'UserRoles',
        timestamps: false // Corrected
    });
    return UserRole;
};