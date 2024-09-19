const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserProfile = sequelize.define('UserProfile', {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportSeries: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportIssuedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportIssuedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  documentPhoto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});

module.exports = UserProfile;
