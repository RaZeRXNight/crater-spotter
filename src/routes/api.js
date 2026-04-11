/*
 * This is where the routes are located...
 * These are connected to the sqlite database
 *
 */
const { default: Comments } = require("../models/comments.js");
const { default: Pins } = require("../models/pins.js");
const { default: Users } = require("../models/users.js");

const router = function (database, sessionStore) {
  // Home API
  const router = require("express").Router();
  router.get("/", (req, res) => {
    res.json({
      message: "Hello World",
    });
  });

  // User Routes
  const userRouter = require("../apis/users.js");
  const usersModel = Users(database);
  usersModel.sync();
  userRouter.default(router, usersModel, sessionStore);

  // Pin Routes
  const pinRouter = require("../apis/pins.js");
  const pinsModel = Pins(database, usersModel);
  pinsModel.sync();
  pinRouter.default(router, pinsModel, usersModel);

  // Comment Routes
  const commentRouter = require("../apis/comments.js");
  const commentsModel = Comments(database);
  commentsModel.sync();
  commentRouter.default(router, commentsModel, usersModel);

  // Relationships
  usersModel.hasMany(pinsModel, {
    foreignKey: "authorid",
  });

  return router;
};

module.exports = router;
