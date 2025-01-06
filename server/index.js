// index.js

// IMPORTS //
const express = require("express");
const app = express();
const router = express.Router();
const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Load environment variables from .env file
require("dotenv").config();

// ROUTERS //

const userRoute = require("./routes/userRoute");
// const networthRoute = require("./routes/networthRoute");

router.use("/user", userRoute);
// router.use("/networth", networthRoute);

app.use(express.json());
app.use(cors());
app.use(router);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
