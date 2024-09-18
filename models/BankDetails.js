const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BankDetails = sequelize.define('BankDetails', {
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  corrAccount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bic: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = BankDetails;
