const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Code = sequelize.define("Code", {
  phoneNumber: {
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
