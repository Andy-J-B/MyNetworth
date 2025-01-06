// Import necessary modules
const express = require("express");
const router = express.Router();

// Import networth-related controllers and middleware ( For authentication)
const networthController = require("../controllers/networthController");
const networthMiddleware = require("../middlewares/networthMiddleware");

// Import token-related controllers and middleware
const tokenController = require("../controllers/tokenController");

// Route to login a networth
router.post(
  "/newNetworth",
  networthMiddleware.validateNetworth,
  tokenController.verifyAccessToken,
  networthMiddleware.checkUserExists,
  networthController.newNetworth
);

// Route to get all networths for user
router.get(
  "/networths",
  tokenController.verifyAccessToken,
  networthMiddleware.checkUserExists,
  networthController.getAllNetworths
);

// Route to get a networth
router.get(
  "/:networth_id",

  tokenController.verifyAccessToken,
  networthMiddleware.checkUserExists,
  networthController.getNetworthById
);

// Route to update a networth's profile
router.put(
  "/:networth_id",

  tokenController.verifyAccessToken,
  networthMiddleware.checkUserExists,
  networthController.updateNetworth
);

// Route to delete a networth
router.delete(
  "/:networth_id",

  tokenController.verifyAccessToken,
  networthMiddleware.checkUserExists,
  networthController.deleteNetworth
);

module.exports = router;
