module.exports = (sequelize, DataTypes) => {
    class Role extends sequelize.Sequelize.Model {
        static associate(models) {
            Role.belongsToMany(models.User, {
                through: models.UserRole,
                foreignKey: 'RoleID',
                otherKey: 'UserID',
                as: 'Users'
            });
        }
    }
    Role.init({
        RoleID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        RoleName: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        Description: { type: DataTypes.TEXT, allowNull: true }
    }, {
        sequelize,
        modelName: 'Role',
        tableName: 'Roles',
        timestamps: false // Corrected
    });
    return Role;
};