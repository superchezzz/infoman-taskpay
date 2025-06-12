module.exports = (sequelize, DataTypes) => {
    class Task extends sequelize.Sequelize.Model {
        static associate(models) {
            Task.hasMany(models.TaskApplication, { foreignKey: 'Task_ID', as: 'Applications' });
            Task.belongsTo(models.User, { foreignKey: 'SelectedApplicantID', as: 'SelectedApplicantDetails' });
            // UPDATED: ClientID now refers to ClientProfile's UserID
            Task.belongsTo(models.ClientProfile, { foreignKey: 'ClientID', as: 'ClientProfileDetails' }); // NEW ALIAS: ClientProfileDetails
        }
    }
    Task.init({
        TaskID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        Title: { type: DataTypes.STRING(255), allowNull: false },
        Description: { type: DataTypes.TEXT, allowNull: false },
        // UPDATED REFERENCES: ClientID now points to client_profiles.UserID
        ClientID: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'client_profiles', key: 'UserID' } },
        ClientName: { type: DataTypes.STRING(255), allowNull: true },
        Budget: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        Category: { type: DataTypes.STRING(100), allowNull: true },
        Location: { type: DataTypes.STRING(255), allowNull: true },
        PostedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        Deadline: { type: DataTypes.DATE, allowNull: true },
        Duration: { type: DataTypes.STRING(100), allowNull: true },
        TaskStatus: { type: DataTypes.ENUM('Open', 'In Progress', 'Completed', 'Closed', 'Filled'), allowNull: false, defaultValue: 'Open' },
        SelectedApplicantID: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'UserID' } },
        SelectedApplicantName: { type: DataTypes.STRING(255), allowNull: true },
        FilledDate: { type: DataTypes.DATE, allowNull: true }
    }, {
        sequelize,
        modelName: 'Task',
        tableName: 'tasks',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    });
    return Task;
};