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
// server.use(cors(corsOptions));
//

// Databases
// Below are migrations

const migrations = require("./src/database/migration.js");

// Routes
// const Routes = require("./src/routes/routes.js");
// server.use("/", Routes);

// APIs
const api = require("./src/routes/api.js");
server.use("/api", api);

// Serves the React distribution
server.get("/", (req, res) => {
  res.sendFile(path.resolve(dist_path, "index.html"));
});

// Server Starts up
server.listen(port, host, () => {
  console.log(`Now Hosting on ${host}:${port}/`);
});
