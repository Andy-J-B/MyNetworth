// index.js

// IMPORTS //
const express = require("express");
const app = express();
const router = express.Router();
// Load environment variables from .env file
require("dotenv").config();

// ROUTERS //

const userRoute = require("./routes/users");
const networthRoute = require("./routes/networthRoute");

router.use("/user", userRoute);
router.use("/networth", networthRoute);

app.use(router);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
