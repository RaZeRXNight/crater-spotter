import { afterAll, beforeAll, beforeEach, expect, test } from "vitest";
import express from "express";
import { Sequelize } from "sequelize";
import Users from "../models/users.js";
import Pins from "../models/pins.js";
import { AUTH_LEVEL } from "../services/constants.js";

process.env.JWT_SECRET = "test-secret";
const { default: pinRouter } = await import("../apis/pins.js");
const { signAccessToken } = await import("../services/jwt.js");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
  logging: false,
});
const usersModel = Users(sequelize);
const pinsModel = Pins(sequelize, usersModel);

let server;
let currentSession;
let user;

function request(body, headers = {}) {
  return fetch(`http://127.0.0.1:${server.address().port}/pin`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  }).then(async (response) => ({
    status: response.status,
    body: await response.json(),
  }));
}

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.session = currentSession;
    next();
  });
  app.use(pinRouter(express.Router(), pinsModel, usersModel));

  server = await new Promise((resolve) => {
    const httpServer = app.listen(0, "127.0.0.1", () => resolve(httpServer));
  });
});

beforeEach(async () => {
  await pinsModel.destroy({ where: {}, truncate: true });
  await usersModel.destroy({ where: {}, truncate: true });

  user = await usersModel.create({
    authLevel: AUTH_LEVEL.STANDARD,
    username: "pin-author",
    email: "pin-author@example.com",
    password: "password",
  });
  currentSession = {
    userid: user.id,
    username: user.username,
    authLevel: user.authLevel,
  };
});

afterAll(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  await sequelize.close();
});

test("allows an authenticated session user to create a pin", async () => {
  const response = await request({
    authorid: user.id,
    title: "A test crater",
    comment: "Observed here",
    lat: 1,
    lng: 2,
  });

  expect(response.status).toBe(200);
  expect(response.body.error).toBe(false);
  expect(await pinsModel.count({ where: { authorid: user.id } })).toBe(1);
});

test("rejects pin creation without an authenticated identity", async () => {
  currentSession = {};

  const response = await request({
    authorid: user.id,
    title: "A test crater",
    comment: "Observed here",
    lat: 1,
    lng: 2,
  });

  expect(response.status).toBe(401);
  expect(await pinsModel.count()).toBe(0);
});

test("allows an authenticated JWT user to create a pin", async () => {
  const token = await signAccessToken({
    userid: user.id,
    username: user.username,
    authLevel: user.authLevel,
  });

  const response = await request(
    {
      authorid: user.id,
      title: "A JWT crater",
      comment: "Observed here",
      lat: 3,
      lng: 4,
    },
    { Authorization: `Bearer ${token}` },
  );

  expect(response.status).toBe(200);
  expect(response.body.error).toBe(false);
  expect(await pinsModel.count({ where: { authorid: user.id } })).toBe(1);
});
