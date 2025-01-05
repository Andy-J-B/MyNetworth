// models/refreshTokenModel.js

// Imports
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Configure database connection
const User = require("./userModel");

// RefreshToken Model
const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Primary key is now user_id
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
  }
);

User.hasOne(RefreshToken, { foreignKey: "user_id", onDelete: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "user_id" });

module.exports = RefreshToken;
