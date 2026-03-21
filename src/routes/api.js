/*
 * This is where the routes are located...
 * These are connected to the sqlite database
 *
 */
const { Sequelize } = require("sequelize");
const { default: Pins } = require("../models/pins.js");
const db = new Sequelize({
  dialect: "sqlite",
  storage: ".sqlite3",
});

// Home API
const router = require("express").Router();
router.get("/", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

// User Routes
const userRouter = require("../apis/users.js");
userRouter.default(router, db);

// Pin Routes
const pinRouter = require("../apis/pins.js");
const pinsModel = Pins(db);
pinsModel.sync();
pinRouter.default(router, pinsModel);

module.exports = router;
