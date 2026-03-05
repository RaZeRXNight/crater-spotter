const ENVIRONMENT = require("process").argv[2];
const express = require("express");
const server = express();
// const cors = require("cors");
const path = require("path");
require("dotenv").config({
  path: ENVIRONMENT,
  override: true,
  debug: ENVIRONMENT ? true : false,
});

// const corsOptions = { origin: ["http://localhost:5173"] };
const dist_path = path.join(process.cwd(), "app", "dist");
const host = process.env.HOST;
const port = process.env.PORT;

server.use(express.static(dist_path));
// server.use(cors(corsOptions));

// Routes
// const Routes = require("./src/routes/routes.js");
// server.use("/", Routes);

const Api = require("./src/routes/api.js");
server.use("/api", Api);

server.get("/", (req, res) => {
  res.sendFile(path.resolve(dist_path, "index.html"));
});

server.listen(port, host, () => {
  console.log(`Now Hosting on ${host}:${port}/`);
});
