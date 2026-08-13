import { afterAll, beforeAll, beforeEach, expect, test } from "vitest";
import express from "express";
import { Sequelize } from "sequelize";
import Users from "../models/users.js";
import userRouter from "../apis/users.js";
import { AUTH_LEVEL } from "../services/constants.js";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
  logging: false,
});
const usersModel = Users(sequelize);

let app;
let server;
let currentUser;
let standardUser;
let targetUser;
let adminUser;

function request(method, path, body = null) {
  const options = {
    method,
    headers: {
      "content-type": "application/json",
      action: "suspend",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return fetch(`http://127.0.0.1:${server.address().port}${path}`, options).then(
    async (response) => ({
      status: response.status,
      body: await response.json(),
    }),
  );
}

async function createUser(username, authLevel) {
  return usersModel.create({
    username,
    email: `${username}@example.com`,
    password: "password",
    authLevel,
  });
}

beforeAll(async () => {
  await sequelize.sync({ force: true });

  app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = currentUser;
    next();
  });
  app.use(userRouter(express.Router(), usersModel));

  server = await new Promise((resolve) => {
    const httpServer = app.listen(0, "127.0.0.1", () => resolve(httpServer));
  });
});

beforeEach(async () => {
  await usersModel.destroy({ where: {}, truncate: true });

  standardUser = await createUser("standard", AUTH_LEVEL.STANDARD);
  targetUser = await createUser("target", AUTH_LEVEL.STANDARD);
  adminUser = await createUser("admin", AUTH_LEVEL.ADMIN);
  currentUser = {
    userid: standardUser.id,
    username: standardUser.username,
    authLevel: AUTH_LEVEL.STANDARD,
  };
});

afterAll(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  await sequelize.close();
});

test("rejects a standard JWT-shaped identity from the admin route", async () => {
  const response = await request("PUT", `/user/${targetUser.id}`, {});

  expect(response.status).toBe(403);
  expect(response.body.message).toBe("Forbidden");
});

test("allows a current administrator to suspend a target user", async () => {
  currentUser = {
    userid: adminUser.id,
    username: "stale-admin-claim",
    authLevel: AUTH_LEVEL.STANDARD,
  };

  const response = await request("PUT", `/user/${targetUser.id}`, {});

  expect(response.status).toBe(200);
  expect(response.body.authLevel).toBe(AUTH_LEVEL.SUSPENDED);
  await targetUser.reload();
  expect(targetUser.authLevel).toBe(AUTH_LEVEL.SUSPENDED);
});
