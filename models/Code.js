const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Code = sequelize.define('Code', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Code;
