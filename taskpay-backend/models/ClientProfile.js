// backend/models/ClientProfile.js (SIMPLIFIED)
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ClientProfile extends Model {
        static associate(models) {
            ClientProfile.belongsTo(models.User, {
                foreignKey: 'UserID', // This foreign key links to users.UserID
                as: 'UserAccountDetails',
                onDelete: 'CASCADE'
            });
        }
    }
    ClientProfile.init({
        UserID: { // This will also be the primary key, acting as a foreign key to User
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'users', // Now refers to the new 'users' table name
                key: 'UserID',
            }
        },
        First_Name: { type: DataTypes.STRING(255), allowNull: false },
        Surname: { type: DataTypes.STRING(255), allowNull: false },
        CompanyName: { type: DataTypes.STRING(255), allowNull: true }, // Optional, based on Task.ClientName usage
    }, {
        sequelize,
        modelName: 'ClientProfile',
        tableName: 'client_profiles', // New table name in snake_case, plural
        timestamps: true, // It's good practice to keep timestamps
        updatedAt: 'UpdatedAt',
        createdAt: 'CreatedAt',
    });
    return ClientProfile;
};