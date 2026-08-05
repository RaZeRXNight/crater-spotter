const ENVIRONMENT = require("process").argv[2];
const express = require("express");
const path = require("path");
const { existsSync } = require("fs");
const cookieParser = require("cookie-parser");
const { Sequelize } = require("sequelize");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { CheckAndMakeDefaultAdminAccount } = require("./services/admin.js");
const {
  DEFAULT_ADMIN_DELAY_MS,
  DEFAULT_PORT,
  sessionSecrets,
} = require("./services/constants.js");
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
const port = process.env.PORT || DEFAULT_PORT;

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
server.use(cookieParser());
sessionStore.sync();

// Public Storage Path
const storage_path = path.resolve(__dirname, "..", process.env.STORAGE_PATH);
server.use(`/${process.env.STORAGE_PATH}`, express.static(storage_path));

// React Path
const dist_path = path.resolve(__dirname, "..", "frontend", "dist");
if (existsSync(path.join(dist_path, "index.html"))) {
  server.use(express.static(dist_path));
  server.use("/", (req, res) =>
    res.sendFile(path.join(dist_path, "index.html")),
  );
}

// Placed Session Store to pass in through here, Will Change Later.
server.use("/api/v1", router(database, sessionStore));

// Server Starts up
server.listen(port, host, () => {
  console.log(`Now Hosting on ${host}:${port}/`);
  // Extra Functionality
  setTimeout(() => {
    CheckAndMakeDefaultAdminAccount(database);
  }, DEFAULT_ADMIN_DELAY_MS);
});
