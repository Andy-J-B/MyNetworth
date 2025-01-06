// models/networthModel.js

// Imports
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Configure database connection
const User = require("./userModel");

// Networth Model
const Networth = sequelize.define(
  "Networth",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Table name of the User model
        key: "id",
      },
      onDelete: "CASCADE", // Cascade delete when the associated User is deleted
    },
    asset_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    asset_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    asset_type: {
      type: DataTypes.ENUM("asset", "liability"), // Restricts values to 'asset' or 'liability'
      allowNull: false,
    },
  },
  {
    tableName: "networth",
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

User.hasMany(Networth, { foreignKey: "user_id", onDelete: "CASCADE" });
Networth.belongsTo(User, { foreignKey: "user_id" });

module.exports = Networth;
