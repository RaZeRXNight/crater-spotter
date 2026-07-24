const ENVIRONMENT = require("process").argv[2];
const express = require("express");
const path = require("path");
const { Sequelize } = require("sequelize");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { CheckAndMakeDefaultAdminAccount } = require("./services/admin.js");
const { sessionSecrets } = require("./services/constants.js");
const router = require("./routes/api.js");
const { logger } = require("./middleware/logging.js");
require("dotenv").config({
  path: ENVIRONMENT,
  override: true,
  debug: ENVIRONMENT ? true : false,
});

// Env Variables
const databaseLocation = process.env.DATABASE;
const sessionSecret = process.env.SESSION_SECRET;
const host = process.env.HOST;
const port = process.env.PORT || 8000;

const database = new Sequelize({
  dialect: process.env.DB_DIALECT,
  storage: path.resolve(__dirname, "..", databaseLocation),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: process.env.DEBUG ? true : false,
});

const sessionStore = new SequelizeStore({
  db: database,
});

const server = express();

// Middleware
server.use(express.json());
server.use(session(sessionSecrets(sessionSecret, sessionStore)));
server.use(logger);
sessionStore.sync();

// Public Storage Path
const storage_path = path.resolve(__dirname, "..", process.env.STORAGE_PATH);
server.use(`/${process.env.STORAGE_PATH}`, express.static(storage_path));

// React Path
const dist_path = path.resolve(__dirname, "..", "frontend", "dist");
server.use(express.static(dist_path));

// Placed Session Store to pass in through here, Will Change Later.
server.use("/api", router(database, sessionStore));

// Serves the React distribution
server.use("/", (req, res) =>
  res.sendFile(path.resolve(dist_path, "index.html")),
);

// Server Starts up
server.listen(port, host, () => {
  console.log(`Now Hosting on ${host}:${port}/`);
  // Extra Functionality
  setTimeout(() => {
    CheckAndMakeDefaultAdminAccount(database);
  }, 1000);
});
