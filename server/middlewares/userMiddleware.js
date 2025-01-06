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

const checkUserExists = async (req, res, next) => {
  try {
    const { email } = req.body;

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

module.exports = {
  hashPassword,
  comparePasswords,
  checkUserExists,
};
