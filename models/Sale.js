const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Sale = sequelize.define(
  "Sale",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true, // Validate that it's an integer
      },
    },
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
      validate: {
        // isUrl: true, // Ensures fileUrl is a valid URL
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true, // Ensure that the price is a valid float number
        min: 0, // Ensures the price is non-negative
      },
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // len: [20, 20], // Ensures the account number is exactly 20 characters long
      },
    },
    saleType: {
      type: DataTypes.ENUM("rights", "license"),
      allowNull: false,
      validate: {
        isIn: [["rights", "license"]], // Restricts value to "rights" or "license"
      },
    },
    isExclusive: {
      type: DataTypes.BOOLEAN,
      allowNull: true, // Set to `true` or `false` for "license" type, `null` otherwise
    },
    licenseTerm: {
      type: DataTypes.INTEGER,
      allowNull: true, // Only required for "license" type
      validate: {
        isInt: true, // Ensures licenseTerm is an integer
        min: 0, // License term should be a positive value or zero
      },
    },
    status: {
      type: DataTypes.ENUM("draft", "confirmed"),
      defaultValue: "draft",
    },
    contractUrl: {
      type: DataTypes.STRING,
      allowNull: true, // Will be populated later when the contract is generated
      validate: {
        isUrl: true, // Ensures contractUrl is a valid URL if provided
      },
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

module.exports = Sale;
