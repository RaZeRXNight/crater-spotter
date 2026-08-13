const ENVIRONMENT = require("process").argv[2];
const express = require("express");
const path = require("path");
const { existsSync } = require("fs");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { default: connectDatabase } = require("./services/connection.js");
const { CheckAndMakeDefaultAdminAccount } = require("./services/admin.js");
const { DEFAULT_PORT, sessionSecrets } = require("./services/constants.js");
const { logger } = require("./middleware/logging.js");
require("dotenv").config({
  path: ENVIRONMENT,
  // Compose environment variables must override host-local .env values.
  override: false,
  debug: ENVIRONMENT ? true : false,
});
const router = require("./routes/api.js");

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

  const server = express();
  server.set("trust proxy", 1);

  // Middleware
  server.use(express.json());
  server.use(session(sessionSecrets(sessionSecret, sessionStore)));
  server.use(logger);
  server.use(cookieParser());

  // Public Storage Path
  const storageRelativePath = (process.env.STORAGE_PATH || "public/storage")
    .replace(/^\/+|\/+$/g, "");
  const storagePath = path.resolve(process.cwd(), storageRelativePath);
  server.use(`/${storageRelativePath}`, express.static(storagePath));

  server.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  server.use("/api/v1", apiRouter);

  await database.sync();
  await CheckAndMakeDefaultAdminAccount(database);

  server.listen(port, host, () => {
    console.log(`Now Hosting on ${host}:${port}/`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start server", error);
  process.exitCode = 1;
});
