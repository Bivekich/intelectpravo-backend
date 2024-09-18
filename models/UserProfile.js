const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserProfile = sequelize.define('UserProfile', {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passportSeries: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passportNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passportIssuedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passportIssuedDate: {
    type: DataTypes.DATE,
    allowNull: false,
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
