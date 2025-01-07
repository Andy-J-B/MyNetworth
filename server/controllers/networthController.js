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

const getAllNetworths = async (req, res) => {
  const user = req.user; // Assuming req.user contains authenticated user info

  try {
    // Get all networths whose user_id matches the user's id
    const networths = await Networth.findAll({
      where: {
        user_id: user.id,
      },
      order: [
        ["asset_type", "ASC"], // First organize by asset_type
        ["asset_name", "ASC"], // Then organize by asset_name
      ],
    });

    if (networths.length === 0) {
      return res
        .status(404)
        .json({ message: "No networths found for the user." });
    }

    res.status(200).json({
      message: "Networths retrieved successfully.",
      data: networths,
    });
  } catch (error) {
    console.error("Error getting all networths:", error);
    res.status(500).json({ error: "Getting all networths failed." });
  }
};

const getNetworthById = async (req, res) => {
  console.log("Getting networth by id");
  const { networth_id } = req.params;

  try {
    // Get the networth entry matching the asset details
    const result = await Networth.findOne({ where: { id: networth_id } });

    // Check if the result is null
    if (!result) {
      return res.status(404).json({
        message: "No matching networth entry found.",
      });
    }

    res.status(200).json({
      message: "Networth successfully fetched.",
      networth: result,
    });
  } catch (error) {
    console.error("Error getting networth:", error);
    res.status(500).json({ error: "Getting networth failed." });
  }
};

const updateNetworth = async (req, res) => {
  const { networth_id } = req.params;
  const { asset_name, asset_type, asset_value } = req.body;

  try {
    // Build the update object dynamically
    const updateData = {};
    if (asset_name) updateData.asset_name = asset_name;
    if (asset_type) updateData.asset_type = asset_type;
    if (asset_value) updateData.asset_value = asset_value;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    console.log(asset_name, asset_type, asset_value, updateData);

    // const [updatedRows] = await Networth.update(updateData, {
    //   where: { id: networth_id },
    // });

    // if (updatedRows === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "Networth not found or no changes made." });
    // }

    res.status(200).json({ message: "Networth updated successfully." });
  } catch (error) {
    console.error("Error updating networth:", error);
    res.status(500).json({ error: "Updating networth failed." });
  }
};

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
