/*
 * This is where the routes are located...
 * These are connected to the PostgreSQL database
 *
 */
const { default: Comments } = require("../models/comments.js");
const { default: Pins } = require("../models/pins.js");
const { default: Users } = require("../models/users.js");

const router = function (database, sessionStore) {
  // Home API
  const router = require("express").Router();

  // User Routes
  const userRouter = require("../apis/users.js");
  const usersModel = Users(database);
  userRouter.default(router, usersModel, sessionStore);

  // Auth Routes
  const authRouter = require("../apis/auth.js");
  authRouter.default(router, usersModel, sessionStore);

  // Mobile Auth Routes — commented out until mobile client is ready
  // const mobileAuthRouter = require("../apis/mobileAuth.js");
  // mobileAuthRouter.default(router, usersModel);

  // Pin Routes
  const pinRouter = require("../apis/pins.js");
  const pinsModel = Pins(database, usersModel);
  pinRouter.default(router, pinsModel, usersModel);

  // Comment Routes
  const commentRouter = require("../apis/comments.js");
  const commentsModel = Comments(database);
  commentRouter.default(router, commentsModel, usersModel);

  // Config Route
  const configRouter = require("../apis/config.js");
  configRouter.default(router);

  // Relationships
  usersModel.hasMany(pinsModel, {
    foreignKey: "authorid",
  });

  return router;
};

module.exports = router;
