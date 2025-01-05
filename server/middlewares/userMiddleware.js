// middlewares/userMiddleware.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenController = require("../controllers/tokenController");
const User = require("../models/userModel");

// Authentication for hashing passwords

const hashPassword = async (plaintextPassword) => {
  const saltRounds = 10;
  return bcrypt.hash(plaintextPassword, saltRounds);
};

const comparePasswords = async (plaintextPassword, hashedPassword) => {
  return bcrypt.compare(plaintextPassword, hashedPassword);
};

const authenticateUser = async (req, res, next) => {
  const token = req.headers.cookie?.split("accessToken=")[1]; // Get token from cookies

  if (!token) {
    return res.status(401).json({ message: "No access token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the access token
    req.email = decoded.email; // Attach email (or other relevant info) from the token to the request
    console.log("Access token is correct and not expired");
    next(); // Proceed to the next middleware or controller
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};

module.exports = {
  hashPassword,
  comparePasswords,
  authenticateUser,
};
