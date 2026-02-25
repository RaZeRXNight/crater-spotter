const ENVIRONMENT = require("process").argv[2];
require("dotenv").config({
  path: ENVIRONMENT,
  override: true,
  debug: ENVIRONMENT ? true : false,
});

const host = process.env.HOST;
const port = process.env.PORT;

const server = require("node:http").createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("<p>Hello World</p>");
});

server.listen(port, host, () => {
  console.log(`Now Hosting on ${host}:${port}/`);
});
