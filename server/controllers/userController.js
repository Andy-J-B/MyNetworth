// controllers/userController.js
const userAuthentication = require("../middlewares/userMiddleware");
const User = require("../models/userModel");

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
      if (error.errors[0].path == "username") {
        return res
          .status(400)
          .json({ error: "username already in use.", err: error });
      } else if (error.errors[0].path == "email") {
        return res
          .status(400)
          .json({ error: "email already in use.", err: error });
      }
    }

    console.error("Error registering user:", error);
    res.status(500).json({ error: "Registration failed." });
  }
};

const loginUser = async (req, res, next) => {
  try {
    console.log("Logging in User");
    const user = req.user;

    const { password } = req.body;

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
  const email = req.email;

  try {
    console.log("Starting logoutUser Controller");

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

const getUserById = async (req, res) => {
  try {
    // Retrieve the user object from the request
    const user = req.user;

    // Respond with the user details
    return res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    // Get email from req.body (or req.user.email if authenticated)
    const user = req.user;

    console.log(`Updating user with email: ${user.email}`);

    // Hash the password before storing it
    const hashedPassword = await userAuthentication.hashPassword(user.password);

    const affectedRows = await User.update(
      {
        username: user.username,
        email: user.email,
        password: hashedPassword,
      },
      {
        where: { id: user.id },
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
    const user = req.user;

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
