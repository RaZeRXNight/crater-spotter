const ENVIRONMENT = require("process").argv[2];
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { default: connectDatabase } = require("./services/connection.js");
const { CheckAndMakeDefaultAdminAccount } = require("./services/admin.js");
const { DEFAULT_PORT, sessionSecrets } = require("./services/constants.js");
const router = require("./routes/api.js");
const { logger } = require("./middleware/logging.js");
require("dotenv").config({
  path: ENVIRONMENT,
  override: true,
  debug: ENVIRONMENT ? true : false,
});

// Env Variables
const sessionSecret = process.env.SESSION_SECRET;
const host = process.env.HOST;
const port = process.env.PORT || DEFAULT_PORT;
const development = process.env.DEVELOPMENT?.toLowerCase() === "true";

async function startServer() {
  const database = connectDatabase(development);
  await database.authenticate();

  const sessionStore = new SequelizeStore({
    db: database,
  });
  const apiRouter = router(database, sessionStore);

  await database.sync();
  await sessionStore.sync();

  const server = express();

  // Middleware
  server.use(express.json());
  server.use(session(sessionSecrets(sessionSecret, sessionStore)));
  server.use(logger);
  server.use(cookieParser());

  // Public Storage Path
  const storage_path = path.resolve(__dirname, "..", process.env.STORAGE_PATH);
  server.use(`/${process.env.STORAGE_PATH}`, express.static(storage_path));

  server.use("/api/v1", apiRouter);
  await CheckAndMakeDefaultAdminAccount(database);

  server.listen(port, host, () => {
    console.log(`Now Hosting on ${host}:${port}/`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start server", error);
  process.exitCode = 1;
});
