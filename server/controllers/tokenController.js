// controllers/userController.js
const RefreshToken = require("../models/refreshTokenModel");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Check if refreshToken still exists
const getRefreshToken = async (email) => {
  try {
    // Look for the refresh token associated with the given email
    const existingToken = await RefreshToken.findOne({
      where: { email: email },
    });

    // If token exists, return it; otherwise, return null
    return existingToken;
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    throw new Error("Error retrieving refresh token");
  }
};

const createRefreshToken = (email) => {
  const refreshToken = jwt.sign(
    { email: email },
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

    // Check if a refresh token already exists for this user
    let existingToken = await getRefreshToken(email);

    if (!existingToken) {
      // No existing refresh token, create and store a new one
      const refreshToken = createRefreshToken(email); // Ensure this generates a secure refresh token

      const newRefreshToken = new RefreshToken({
        email: email,
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
    const email = req.email;

    if (!email) {
      return res
        .status(400)
        .json({ message: "No email provided to log out user" });
    }

    const existingToken = await getRefreshToken(email);

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
      where: { email: email },
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
    return res.status(500).json({ message: "Internal server error" });
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
  console.log("Verifying the Access Token");

  // First, check if accessToken exists in cookies
  const accessToken = req.headers.cookie?.split("accessToken=")[1];
  if (!accessToken) {
    console.log("No access token provided");
    return await handleTokenRefresh(req, res);
  }

  try {
    // Try to verify the existing access token
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log("Access token is correct and not expired");

    return res.json({
      message: "Access token is valid",
      token: accessToken, // You can return the access token if needed
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Access token has expired");
      return await handleTokenRefresh(req, res); // Handle token refresh if expired
    } else {
      console.log("Error verifying access token", error);
      return res.status(401).json({ error: "Invalid or expired access token" });
    }
  }
};

// Handle token refresh if access token doesn't exist or is expired
const handleTokenRefresh = async (req, res) => {
  try {
    const { email } = req.body; // Assuming email is in request body, or from decoded JWT

    // Fetch the user by email
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "User with this email does not exist" });
    }

    // Fetch the refresh token from DB using email
    const refreshToken = await getRefreshToken(email);
    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "No refresh token found for this user" });
    }

    // Verify refresh token and generate new access token
    jwt.verify(
      refreshToken.dataValues.token,
      process.env.REFRESH_JWT_SECRET,
      (err, decoded) => {
        if (err) {
          console.log("Error verifying refresh token", err);
          return res
            .status(401)
            .json({ message: "Invalid or expired refresh token" });
        }

        console.log("Refresh token verified");

        // Create a new access token
        const newAccessToken = generateAccessToken(email);

        // Send the new access token in cookies
        res.cookie("accessToken", newAccessToken, {
          maxAge: 900000, // 15 minutes
          secure: true, // Set to true if you're using https
          httpOnly: true,
          sameSite: "strict",
        });

        return res.json({
          message: "Access token refreshed successfully",
          token: newAccessToken,
        });
      }
    );
  } catch (error) {
    console.log("Error in handleTokenRefresh", error);
    return res
      .status(500)
      .json({ message: "Server error while refreshing token" });
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
