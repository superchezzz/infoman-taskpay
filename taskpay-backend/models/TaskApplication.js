module.exports = (sequelize, DataTypes) => {
    class TaskApplication extends sequelize.Sequelize.Model {
        static associate(models) {
            TaskApplication.belongsTo(models.User, { foreignKey: 'Applicant_ID', as: 'ApplicantDetails' });
            TaskApplication.belongsTo(models.Task, { foreignKey: 'Task_ID', as: 'TaskDetails' });
        }
    }
    TaskApplication.init({
        ApplicationID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        Applicant_ID: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'UserID' } },
        Task_ID: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Tasks', key: 'TaskID' } },
        ApplicationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        Status: {
            type: DataTypes.ENUM('Pending', 'ViewedByAdmin', 'Shortlisted', 'Approved', 'Withdrawn', 'Rejected', 'InProgress', 'SubmittedForReview', 'Completed', 'Cancelled'),
            allowNull: false, defaultValue: 'Pending'
        },
        CoverLetter: { type: DataTypes.TEXT, allowNull: true },
        ApplicantProposedBudget: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        AdminFeedback: { type: DataTypes.TEXT, allowNull: true },
        ApplicantFeedback: { type: DataTypes.TEXT, allowNull: true }
    }, {
        sequelize,
        modelName: 'TaskApplication',
        tableName: 'TaskApplications',
        timestamps: false, // Corrected
        indexes: [{ unique: true, fields: ['Applicant_ID', 'Task_ID'] }]
    });
    return TaskApplication;
};