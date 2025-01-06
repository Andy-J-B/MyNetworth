// controllers/userController.js
const Networth = require("../models/networthModel");
const User = require("../models/userModel");

const newNetworth = async (req, res) => {
  const user = req.user;
  const { asset_name, asset_type, asset_value } = req.body;

  try {
    const newNetworth = await Networth.create({
      user_id: user.id,
      asset_name: asset_name,
      asset_value: asset_value,
      asset_type: asset_type,
    });

    res.status(201).json({
      message: "Registration successful!",
      networth: {
        user_id: user.id,
        asset_name: asset_name,
        asset_value: asset_value,
        asset_type: asset_type,
      },
    });
  } catch (error) {
    // If there is a validation error, Sequelize will throw it
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: "Invalid data format for model" });
    }

    console.error("Error registering user:", error);
    res.status(500).json({ error: "Registration failed." });
  }
};

const getAllNetworths = async (req, res) => {};

const getNetworthById = async (req, res) => {};

const updateNetworth = async (req, res) => {};

const deleteNetworth = async (req, res) => {};

module.exports = {
  newNetworth,
  getAllNetworths,
  getNetworthById,
  updateNetworth,
  deleteNetworth,
};
