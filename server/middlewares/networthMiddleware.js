// middlewares/userMiddleware.js
const User = require("../models/userModel");

const checkUserExists = async (req, res, next) => {
  try {
    const email = req.email;

    // Check if user exists
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "User with this email does not exist" });
    }

    // Attach user to request object
    req.user = user;

    console.log(email, user);

    // Proceed to the next middleware or controller
    next();
  } catch (err) {
    console.error("Error in checking user:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const validateNetworth = async (req, res, next) => {
  try {
    const { asset_name, asset_type, asset_value } = req.body;

    if (!asset_name || !asset_type || !asset_value) {
      return res.status(400).json({ message: "Missing data" });
    }

    // Check if asset_type is a string and is either 'asset' or 'liability'
    if (typeof asset_type !== "string") {
      return res.status(400).json({ message: "asset_type must be a string" });
    }
    if (asset_type !== "asset" && asset_type !== "liability") {
      return res
        .status(400)
        .json({ message: "asset_type must be either 'asset' or 'liability'" });
    }

    // Check if asset_value is a positive number
    if (typeof asset_value !== "number" || asset_value <= 0) {
      return res
        .status(400)
        .json({ message: "asset_value must be a positive number" });
    }

    // If validation passes, move to the next middleware/controller
    next();
  } catch (error) {
    console.error("Error in validating networth", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  checkUserExists,
  validateNetworth,
};
