// Import necessary modules
const express = require("express");
const router = express.Router();

// Import user-related controllers and middleware ( For authentication)
const userController = require("../controllers/user");

// Import token-related controllers and middleware
const tokenController = require("../controllers/token");

// Route to register a new user
router.post("/register", userController.registerUser);

// Route to login a user
router.post(
  "/login",
  userController.loginUser,
  tokenController.newRefreshToken,
  tokenController.verifyAccessToken
);

// Route to logout a user
router.post(
  "/logout",

  tokenController.deleteRefreshToken,
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
