/*
 * This is where the routes are located...
 * These are connected to the sqlite database
 *
 */
const { default: Pins } = require("../models/pins.js");
const { default: Users } = require("../models/users.js");

const router = function (db) {
  // Home API
  const router = require("express").Router();
  router.get("/", (req, res) => {
    res.json({
      message: "Hello World",
    });
  });

  // User Routes
  const userRouter = require("../apis/users.js");
  const usersModel = Users(db);
  usersModel.sync();
  userRouter.default(router, usersModel);

  // Pin Routes
  const pinRouter = require("../apis/pins.js");
  const pinsModel = Pins(db, usersModel);
  pinsModel.sync();
  pinRouter.default(router, pinsModel, usersModel);

  return router;
};

module.exports = router;
