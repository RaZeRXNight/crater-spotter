const ENVIRONMENT = require("process").argv[2];
const express = require("express");
const server = express();
const sqlite = require("node:sqlite");
const path = require("path");
require("dotenv").config({
  path: ENVIRONMENT,
  override: true,
  debug: ENVIRONMENT ? true : false,
});

const dist_path = path.join(process.cwd(), "app", "dist");
const host = process.env.HOST;
const port = process.env.PORT;

server.use(express.static(dist_path));

// APIs
const { router, userRouter, pinRouter } = require("./src/routes/api.js");
server.use("/api", router);
server.use("/api/", userRouter);
server.use("/api/", pinRouter);

// Serves the React distribution
server.get("/", (req, res) => {
  res.sendFile(path.resolve(dist_path, "index.html"));
});

// Server Starts up
server.listen(port, host, () => {
  console.log(`Now Hosting on ${host}:${port}/`);
});
