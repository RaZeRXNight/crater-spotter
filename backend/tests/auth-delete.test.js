import { afterAll, beforeAll, beforeEach, expect, test } from "vitest";
import express from "express";
import { DataTypes, Sequelize } from "sequelize";
import Users from "../models/users.js";
import { AUTH_LEVEL } from "../services/constants.js";

process.env.JWT_SECRET = "test-secret";
const { default: authRouter } = await import("../apis/auth.js");
const { signAccessToken } = await import("../services/jwt.js");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
  logging: false,
});
const usersModel = Users(sequelize);
const commentsModel = sequelize.define("Comments", {
  authorid: DataTypes.INTEGER,
});

let server;
let currentSession;
let user;

function request(headers = {}) {
  return fetch(`http://127.0.0.1:${server.address().port}/auth/delete`, {
    method: "DELETE",
    headers,
  }).then(async (response) => ({
    status: response.status,
    body: await response.json(),
  }));
}

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const app = express();
  app.use((req, res, next) => {
    req.session = currentSession;
    next();
  });
  app.use(authRouter(express.Router(), usersModel));

  server = await new Promise((resolve) => {
    const httpServer = app.listen(0, "127.0.0.1", () => resolve(httpServer));
  });
});

beforeEach(async () => {
  await commentsModel.destroy({ where: {}, truncate: true });
  await usersModel.destroy({ where: {}, truncate: true });

  user = await usersModel.create({
    authLevel: AUTH_LEVEL.STANDARD,
    username: "delete-me",
    email: "delete-me@example.com",
    password: "password",
  });
  await commentsModel.create({ authorid: user.id });
  currentSession = {
    userid: user.id,
    username: user.username,
    authLevel: user.authLevel,
    destroy(callback) {
      callback();
    },
  };
});

afterAll(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  await sequelize.close();
});

test("allows an authenticated session user to delete their own account", async () => {
  const response = await request();

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Account deleted");
  expect(await usersModel.count({ where: { id: user.id } })).toBe(0);
  expect(await commentsModel.count({ where: { authorid: user.id } })).toBe(0);
});

test("rejects account deletion without a session identity", async () => {
  currentSession = {};

  const response = await request();

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Unauthorized");
  expect(await usersModel.count({ where: { id: user.id } })).toBe(1);
});

test("allows an authenticated JWT user to delete their own account", async () => {
  const token = await signAccessToken({
    userid: user.id,
    username: user.username,
    authLevel: user.authLevel,
  });

  const response = await request({ Authorization: `Bearer ${token}` });

  expect(response.status).toBe(200);
  expect(await usersModel.count({ where: { id: user.id } })).toBe(0);
});
