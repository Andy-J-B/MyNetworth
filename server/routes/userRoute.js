// Import necessary modules
const express = require("express");
const router = express.Router();

// Import user-related controllers and middleware ( For authentication)
const userController = require("../controllers/userController");
const userMiddleware = require("../middlewares/userMiddleware");

// Import token-related controllers and middleware
const tokenController = require("../controllers/tokenController");

// Route to register a new user
router.post("/register", userController.registerUser);

// Route to login a user
router.post(
  "/login",
  // Login and check user password
  userController.loginUser,
  // Make a new access token
  tokenController.newAccessToken,
  // Make a new refresh token
  tokenController.newRefreshToken
);

// Route to logout a user
router.post(
  "/logout",
  // Authenticate user
  userMiddleware.authenticateUser,
  // Delete refresh token
  tokenController.deleteRefreshToken,
  // Logout user (Delete access token)
  userController.logoutUser
);

// Route to get a user
router.get(
  "/:user_id",
  userController.getUserById,
  tokenController.verifyAccessToken
);

// Route to update a user's profile
router.put(
  "/:user_id",

  userController.updateUser,
  tokenController.verifyAccessToken
);

// Route to delete a user
router.delete(
  "/:user_id",
  tokenController.deleteRefreshToken,
  userController.deleteUser
);

module.exports = router;
