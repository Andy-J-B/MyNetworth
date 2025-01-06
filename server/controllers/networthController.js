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

const deleteNetworth = async (req, res) => {
  // Get user_id
  console.log("Delete networth");
  const { networth_id } = req.params;

  try {
    // Destroy the networth entry matching the asset details
    const result = await Networth.destroy({
      where: {
        id: networth_id,
      },
    });

    if (result === 0) {
      return res.status(404).json({
        message: "No matching networth entry found to delete.",
      });
    }

    res.status(200).json({
      message: "Networth successfully deleted.",
    });
  } catch (error) {
    console.error("Error deleting networth:", error);
    res.status(500).json({ error: "Deleting networth failed." });
  }
};

module.exports = {
  newNetworth,
  getAllNetworths,
  getNetworthById,
  updateNetworth,
  deleteNetworth,
};
