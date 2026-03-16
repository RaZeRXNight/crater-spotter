/*
 * This is where the routes are located...
 * These are connected to the sqlite database
 *
 */
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync(".sqlite3");

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
pinRouter.default(router, db);

module.exports = router;
