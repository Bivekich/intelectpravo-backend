const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sale = sequelize.define('Sale', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  saleType: {
    type: DataTypes.ENUM('rights', 'license'),
    allowNull: false,
  },
  isExclusive: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  licenseTerm: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'confirmed'),
    defaultValue: 'draft',
  },
  contractUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Sale;
