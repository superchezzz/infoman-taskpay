const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database'); // Adjust path if your file structure is different

class User extends Model {
    // Method to check password
    async isValidPassword(password) {
        return bcrypt.compare(password, this.PasswordHash);
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
    },
    Role: {
        type: DataTypes.ENUM('applicant', 'admin'),
        allowNull: false,
        defaultValue: 'applicant'
    }
    // CreatedAt and UpdatedAt are automatically managed by Sequelize if timestamps: true (default)
}, {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // Explicitly defining table name
    timestamps: true // Enables CreatedAt and UpdatedAt
});

// Hook to hash password before user is created or updated
const hashPassword = async (user) => {
    if (user.changed('PasswordHash') || user.isNewRecord) {
        const salt = await bcrypt.genSalt(10);
        user.PasswordHash = await bcrypt.hash(user.PasswordHash, salt);
    }
};

User.beforeCreate(hashPassword);
User.beforeUpdate(hashPassword); // If you allow password updates directly on PasswordHash field

module.exports = User;