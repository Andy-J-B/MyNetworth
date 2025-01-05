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

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ message: "No access token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId; // Attach user ID to request
    next(); // Proceed to the next step (controller)
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res
      .status(401)
      .json({ message: "Invalid or malformed access token" });
  }
};

module.exports = {
  hashPassword,
  comparePasswords,
  authenticateUser,
};
