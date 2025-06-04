// taskpay-backend/models/Task.js
module.exports = (sequelize, DataTypes) => {
    class Task extends sequelize.Sequelize.Model {
        static associate(models) {
            // Task has many TaskApplications
            Task.hasMany(models.TaskApplication, {
                foreignKey: 'Task_ID',
                as: 'Applications'
            });

            // If tasks are created by users (clients/admins) - for future
            // Task.belongsTo(models.User, {
            //     foreignKey: 'ClientID',
            //     as: 'ClientPoster' // Changed alias for clarity
            // });
        }
    }

    Task.init({
        TaskID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        Title: { type: DataTypes.STRING(255), allowNull: false },
        Description: { type: DataTypes.TEXT, allowNull: false },
        ClientID: { type: DataTypes.INTEGER, allowNull: true /* references: { model: 'Users', key: 'UserID' } */ },
        ClientName: { type: DataTypes.STRING(255), allowNull: true },
        Budget: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        Category: { type: DataTypes.STRING(100), allowNull: true },
        Location: { type: DataTypes.STRING(255), allowNull: true },
        PostedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        Deadline: { type: DataTypes.DATE, allowNull: true },
        Duration: { type: DataTypes.STRING(100), allowNull: true },
        TaskStatus: { type: DataTypes.ENUM('Open', 'In Progress', 'Completed', 'Closed', 'Filled'), allowNull: false, defaultValue: 'Open' }
    }, {
        sequelize,
        modelName: 'Task',
        tableName: 'Tasks',
        timestamps: true
    });

    return Task;
};