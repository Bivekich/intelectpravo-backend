const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserProfile = sequelize.define("UserProfile", {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patronymic: {
    type: DataTypes.STRING,
    allowNull: true,
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
  passportCode: {
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
    allowNull: true,
    unique: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  toSend: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = UserProfile;
