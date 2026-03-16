/*
 * This is where the routes are located...
 * These are connected to the sqlite database
 *
 */

const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync(".sqlite3");

const router = require("express").Router();

// Home API
router.get("/", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

const userRouter = require("express").Router();

// User DB API
// Routes
userRouter.get("/user/", (req, res) => {
  res.json({
    message: "Hello List of Users",
  });
});

userRouter.get("/user", (req, res) => {
  res.json({
    message: "Get User Information by ID",
  });
});

userRouter.post("/user", (req, res) => {
  res.json({
    message: "Put up information about user",
  });
});

userRouter.put("/user", (req, res) => {
  res.json({
    message: "Change user information",
  });
});

userRouter.delete("/user", (req, res) => {
  res.json({
    message: "Delete User",
  });
});

//
// Pin DB API
// Routes
//

const pinRouter = require("express").Router();

pinRouter.get("/pin/", (req, res) => {
  res.json({
    message: "Hello List of pins",
  });
});

pinRouter.get("/pin", (req, res) => {
  res.json({
    message: "Get pin Information by ID",
  });
});

pinRouter.post("/pin", (req, res) => {
  res.json({
    message: "Put up information about pin",
  });
});

pinRouter.put("/pin", (req, res) => {
  res.json({
    message: "Change pin information",
  });
});

pinRouter.delete("/pin", (req, res) => {
  res.json({
    message: "Delete pin",
  });
});

module.exports = { router, userRouter, pinRouter };
