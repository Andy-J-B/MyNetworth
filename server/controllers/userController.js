// controllers/userController.js
const userAuthentication = require("../middlewares/userMiddleware");
const User = require("../models/userModel");
const RefreshToken = require("../models/tokenModel");
const tokenController = require("./tokenController");

// Check if refreshToken still exists

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password before storing it
    const hashedPassword = await userAuthentication.hashPassword(password);

    // Create a new user
    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email, // Avoid sending password or sensitive info
      },
    });
  } catch (error) {
    // If there is a validation error, Sequelize will throw it
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Handle other types of errors (like unique constraint violation)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email already in use." });
    }

    console.error("Error registering user:", error);
    res.status(500).json({ error: "Registration failed." });
  }
};

const loginUser = async (req, res, next) => {
  try {
    console.log("Logging in User");
    const { email, password } = req.body;

    // Fetch the user from the database based on the email
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "User with this email does not exist" });
    }

    req.user = user;

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await userAuthentication.comparePasswords(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    console.log("Done Logging in User");
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    console.log("Starting logoutUser Controller");

    // Fetch the user from the database based on the email
    const user = await User.findOne({ where: { email: email } });

    // Check if user exists
    if (!user) {
      return res
        .status(401)
        .json({ message: "User with this email does not exist" });
    }

    // Now delete session data and refresh token.

    // Set token to none and expire
    res.cookie("accessToken", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure secure if in production
      sameSite: "strict", // Set to 'strict' for added security
    });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res, next) => {
  try {
    // get the email
    const { email } = req.params;

    // find the user in the db
    const user = await User.findOne({
      where: { email: email },
      attributes: ["id", "username", "email"],
    });

    // if there is no user, return error
    if (!user) {
      return res
        .status(404)
        .json({ message: "There is no user with this email" });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    // Get email from req.body (or req.user.email if authenticated)
    const { email, username, password } = req.body;

    // Check for required fields
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`Updating user with email: ${email}`);

    // Find the user by email
    const user = await User.findOne({ where: { email: email } });

    // If the user doesn't exist, return a 404 Not Found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the password before storing it
    const hashedPassword = await userAuthentication.hashPassword(password);

    const affectedRows = await User.update(
      {
        username: username,
        email: email,
        password: hashedPassword,
      },
      {
        where: { user_id: user_id },
      }
    );
    // Check if the user was updated successfully
    if (affectedRows[0] === 0) {
      return res.status(400).json({ message: "No changes made" });
    }
    res.status(200).json({ message: "User has been updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Get user_id
    console.log("Delete User");
    const email = req.params.email;
    console.log(req.params.email);

    // Find the user by ID
    const user = await User.findByPk(email);

    // If the user doesn't exist, return a 404 Not Found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();

    res.status(200).json({ message: "User has been deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout -> deletes refresh token in database

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserById,
  updateUser,
  deleteUser,
};
