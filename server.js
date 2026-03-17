const ENVIRONMENT = require("process").argv[2];
const express = require("express");
const server = express();
const path = require("path");
require("dotenv").config({
  path: ENVIRONMENT,
  override: true,
  debug: ENVIRONMENT ? true : false,
});

const host = process.env.HOST;
const port = process.env.PORT;

const dist_path = path.join(process.cwd(), "app", "dist");
server.use(express.static(dist_path));

// APIs
const router = require("./src/routes/api.js");
server.use("/api", router);

// Serves the React distribution
server.use("/", (req, res) =>
  res.sendFile(path.resolve(dist_path, "index.html")),
);

// Server Starts up
server.listen(port, host, () => {
  console.log(`Now Hosting on ${host}:${port}/`);
});
