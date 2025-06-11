'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Location extends Model {
        static associate(models) {
            // A Location can belong to many Applicants through the join table
            Location.belongsToMany(models.Applicant, {
                through: 'Applicant_Location_Preferences',
                foreignKey: 'LocationID',
                otherKey: 'ApplicantID',
                as: 'Applicants'
            });
        }
    }
    Location.init({
        LocationID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        LocationName: { type: DataTypes.STRING, allowNull: false, unique: true }
    }, {
        sequelize,
        modelName: 'Location',
        tableName: 'Locations',
        timestamps: false
    });
    return Location;
};