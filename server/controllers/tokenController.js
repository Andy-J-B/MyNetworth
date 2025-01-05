// controllers/userController.js
const RefreshToken = require("../models/refreshTokenModel");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Check if refreshToken still exists
const getRefreshToken = async (user_id) => {
  try {
    // Look for the refresh token associated with the given user_id
    const existingToken = await RefreshToken.findOne({
      where: { user_id: user_id },
    });

    // If token exists, return it; otherwise, return null
    return existingToken;
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    throw new Error("Error retrieving refresh token");
  }
};

const createRefreshToken = (user_id) => {
  const refreshToken = jwt.sign(
    { user_id: user_id },
    process.env.REFRESH_JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  return refreshToken;
};

const newRefreshToken = async (req, res, next) => {
  const { email } = req.body;
  try {
    // Fetch the user from the database based on the email
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "User with this email does not exist" });
    }

    console.log("Creating new Refresh Token");

    const user_id = user.id;

    // Check if a refresh token already exists for this user
    let existingToken = await getRefreshToken(user_id);

    if (!existingToken) {
      // No existing refresh token, create and store a new one
      const refreshToken = createRefreshToken(user_id); // Ensure this generates a secure refresh token

      const newRefreshToken = new RefreshToken({
        user_id: user_id,
        token: refreshToken,
      });

      // Save the new refresh token to the database
      await newRefreshToken.save();
      console.log("New refresh token created and saved.");
    } else {
      console.log("Refresh token already exists");
    }

    next();
  } catch (error) {
    console.error("Error in creating new refresh token:", error);
    return res.status(500).json({ error: "Failed to create refresh token." });
  }
};

const deleteRefreshToken = async (req, res, next) => {
  try {
    const user_id = parseInt(req.body.user_id);

    if (!user_id) {
      return res
        .status(400)
        .json({ message: "No user ID provided to log out user" });
    }

    const existingToken = await getRefreshToken(user_id);

    if (!existingToken) {
      // If no refresh token exists for the user, just proceed
      console.log("No refresh token found for this user.");
      return res
        .status(400)
        .json({ message: "No refresh token found for this user." });
    }

    // Verify the refresh token
    try {
      jwt.verify(
        existingToken.dataValues.token,
        process.env.REFRESH_JWT_SECRET
      );
      console.log("Refresh token is valid and not expired");
    } catch (error) {
      console.log("Error verifying refresh token:", error);
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Token exists
    // Delete Refresh Token

    // Delete the refresh token from the database to log the user out
    const rowsDeleted = await RefreshToken.destroy({
      where: { user_id: user_id },
    });

    if (rowsDeleted > 0) {
      console.log("Refresh token deleted successfully.");
    } else {
      console.log("No matching refresh token found for this user.");
      return res
        .status(404)
        .json({ message: "No refresh token found to delete" });
    }

    next();
  } catch (error) {
    console.error("Error deleting refresh token:", error);
  }
};

// Function to generate a new access token using a refresh token
const generateAccessToken = (user) => {
  try {
    // Generate a new access token using the extracted information
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m", // Set the expiration time for the access token
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken: accessToken, // Send the token to the user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyAccessToken = async (req, res) => {
  // Does it exist
  // Is it right
  // Did it expire

  console.log("Verify the Access Token");
  accessToken = req.headers.cookie?.split("accessToken=")[1];
  console.log(accessToken);

  if (!accessToken) {
    try {
      console.log("No access token provided");

      const { email } = req.body;

      // Fetch the user from the database based on the email
      const user = await User.findOne({ where: { email: email } });

      if (!user) {
        return res
          .status(401)
          .json({ message: "User with this email does not exist" });
      }

      refreshToken = await getRefreshToken(user.user_id);

      const decodedToken = jwt.verify(
        refreshToken.dataValues.token,
        process.env.REFRESH_JWT_SECRET
      );

      // Access token has expired
      const accessToken = generateAccessToken(decodedToken.user_id);

      res.cookie("accessToken", accessToken, {
        maxAge: 900000, // 15 minutes
        secure: true, // set to true if you're using https
        httpOnly: true,
        sameSite: "strict",
      });

      return res.json({
        message: "accessToken has been made",
        token: accessToken,
      });
    } catch (error) {
      console.log("Error verifying Refresh Token");

      // Either it expired or an error
      // Both should log out user
    }
  }

  try {
    // Verify the access token if it is right and not expired
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log("accessToken is correct and not expired");
    return res.json({ message: accessToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Access token has expired");

      // Create a new accessToken
      const accessToken = generateAccessToken(decodedToken.user_id);

      res.cookie("accessToken", accessToken, {
        maxAge: 900000, // 15 minutes
        secure: true, // set to true if you're using https
        httpOnly: true,
        sameSite: "strict",
      });

      return res.json({ message: "accessToken has been made" });
    } else {
      console.log("Error verifying access token", error);
      return res.json({ error: error });
    }
  }
};

module.exports = {
  newRefreshToken,
  getRefreshToken,
  createRefreshToken,
  deleteRefreshToken,
  generateAccessToken,
  verifyAccessToken,
};
