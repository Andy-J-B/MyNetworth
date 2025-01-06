// controllers/userController.js
const RefreshToken = require("../models/tokenModel");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Check if refreshToken still exists
const getRefreshToken = async (user) => {
  try {
    console.log(user.id);
    // Look for the refresh token associated with the given email
    const existingToken = await RefreshToken.findOne({
      where: { user_id: user.id },
    });

    console.log(existingToken);

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

const newRefreshToken = async (req, res) => {
  const { email } = req.body;
  const accessToken = req.accessToken;
  const user = req.user;
  try {
    // Check if user exists already done beforehand
    if (!user) {
      return res
        .status(401)
        .json({ message: "User with this email does not exist" });
    }

    console.log("Creating new Refresh Token");

    // Check if a refresh token already exists for this user
    let existingToken = await getRefreshToken(user);

    if (!existingToken) {
      // No existing refresh token, create and store a new one
      existingToken = createRefreshToken(email); // Ensure this generates a secure refresh token

      // Calculate expires_at (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Add 30 days to the current date

      const newRefreshToken = new RefreshToken({
        user_id: user.id,
        token: existingToken,
        expires_at: expiresAt,
      });

      await newRefreshToken.save();
      console.log("New refresh token saved successfully");
    } else {
      console.log("Refresh token already exists");
    }

    res.cookie("accessToken", accessToken, {
      maxAge: 900000, // 15 minutes
      secure: true, // Set to true if you're using https
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Refresh token created and access token set in cookie.",
      accessToken: accessToken, // Optionally return the access token
    });
  } catch (error) {
    console.error("Error in creating new refresh token:", error);
    return res.status(500).json({ error: "Failed to create refresh token." });
  }
};

const deleteRefreshToken = async (req, res, next) => {
  try {
    console.log("Deleting refresh token");
    const email = req.email;
    const user = req.user;

    if (!email) {
      return res
        .status(400)
        .json({ message: "No email provided to log out user" });
    }
    console.log("Check if refresh token exists");
    const existingToken = await getRefreshToken(user);

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
      where: { user_id: user.id },
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
const generateAccessToken = (req, res, next) => {
  const { email } = req.body;
  try {
    // Generate a new access token using the extracted information
    const accessToken = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "15m", // Set the expiration time for the access token
    });

    req.accessToken = accessToken;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyAccessToken = async (req, res, next) => {
  console.log("Verifying the Access Token");

  // Check if access token exists in cookies
  let accessToken = req.cookies.accessToken;

  // If there's no access token in the cookies, attempt to refresh it
  if (!accessToken) {
    return res.status(401).json({ message: "No access token provided" });
  }

  // At this point, we either have a valid access token or a refreshed one
  try {
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET); // Verify the access token
    console.log("Access token is correct and not expired", decodedToken);

    req.email = decodedToken.email; // Attach the user's email to the request

    next(); // Proceed to the next middleware/controller
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Access token expired, attempting to refresh...");

      // Attempt to refresh the access token
      const newAccessToken = await handleTokenRefresh(req, res);
      if (newAccessToken) {
        // Set the new access token as a cookie
        res.cookie("accessToken", newAccessToken, {
          maxAge: 900000, // 15 minutes
          secure: true,
          httpOnly: true,
          sameSite: "strict",
        });

        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET); // Verify the access token

        req.email = decodedToken.email; // Attach the user's email to the request

        // Retry the original request with the new access token
        next();
      } else {
        return res
          .status(401)
          .json({ message: "Unable to refresh access token" });
      }
    } else {
      console.log("Error verifying access token", error);
      return res
        .status(401)
        .json({ message: "Invalid or expired access token" });
    }
  }
};

// Handle token refresh if access token doesn't exist or is expired
const handleTokenRefresh = async (user) => {
  try {
    console.log("Refreshing token for user ID:", user.id);

    // Fetch the refresh token from DB using the user ID
    const refreshToken = await getRefreshToken(user);
    if (!refreshToken) {
      console.log("No refresh token found for this user");
      throw new Error("No refresh token found. Please log in again.");
    }

    // Verify the refresh token
    try {
      const decoded = jwt.verify(
        refreshToken.dataValues.token,
        process.env.REFRESH_JWT_SECRET
      );
      console.log("Refresh token verified:", decoded);

      // Create a new access token
      const newAccessToken = jwt.sign(
        { email: decoded.email }, // Use email from decoded payload
        process.env.JWT_SECRET,
        {
          expiresIn: "15m", // Set the expiration time for the access token
        }
      );

      console.log("New access token generated successfully");
      return newAccessToken; // Return the new access token
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        console.log("Refresh token has expired");
        throw new Error("Refresh token expired. Please log in again.");
      }
      console.log("Error verifying refresh token:", err);
      throw new Error("Invalid refresh token. Please log in again.");
    }
  } catch (error) {
    console.error("Error in handleTokenRefresh:", error.message);
    throw error; // Throw the error to the calling function
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
