import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import express from "express";
import { Sequelize } from "sequelize";
import apiRouter from "../routes/api.js";
import { AUTH_LEVEL } from "../services/constants.js";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
  logging: false,
});

let server;
let session;
let user;
let pin;
let comment;

function request(path, options = {}) {
  return fetch(`http://127.0.0.1:${server.address().port}${path}`, {
    signal: AbortSignal.timeout(1000),
    ...options,
  }).then(async (response) => {
    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";

    return {
      status: response.status,
      body:
        contentType.includes("application/json") && text
          ? JSON.parse(text)
          : null,
    };
  });
}

async function expectMessage(path, options = {}) {
  const response = await request(path, options);

  expect(response.body).toEqual(expect.objectContaining({ message: expect.anything() }));
  expect(Object.hasOwn(response.body, "message")).toBe(true);
  expect(response.body.message).not.toBeNull();

  if (typeof response.body.message === "string") {
    expect(response.body.message.trim()).not.toBe("");
  }

  return response;
}

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.session = session;
    next();
  });
  app.use(apiRouter(sequelize, {}));

  await sequelize.sync({ force: true });
  server = await new Promise((resolve) => {
    const httpServer = app.listen(0, "127.0.0.1", () => resolve(httpServer));
  });
});

beforeEach(async () => {
  const { Comments, Pins, Users } = sequelize.models;
  await Comments.destroy({ where: {}, truncate: true });
  await Pins.destroy({ where: {}, truncate: true });
  await Users.destroy({ where: {}, truncate: true });

  user = await Users.create({
    authLevel: AUTH_LEVEL.STANDARD,
    username: "response-user",
    email: "response-user@example.com",
    password: "password",
  });
  pin = await Pins.create({
    authorid: user.id,
    title: "Response pin",
    comment: "A pin",
    lat: 1,
    lng: 2,
  });
  comment = await Comments.create({
    authorid: user.id,
    PinParent: pin.id,
    CommentParent: null,
    replyLevel: 0,
    comment: "A comment",
  });
  session = {
    userid: user.id,
    username: user.username,
    authLevel: user.authLevel,
    destroy(callback) {
      callback();
    },
    regenerate(callback) {
      callback();
    },
    save(callback) {
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

test("user success and error paths return a message", async () => {
  await expectMessage("/user/");
  await expectMessage(`/user/${user.id}`, {
    headers: { userid: user.id },
  });
  await expectMessage(`/user/${user.id}`, { method: "PUT" });
  await expectMessage(`/user/${user.id}`, { method: "DELETE" });
});

test("user lookup without an id returns a message", async () => {
  await expectMessage(`/user/${user.id}`);
});

test("auth success paths return a message", async () => {
  await expectMessage("/auth");
  await expectMessage("/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "registered-user",
      email: "registered-user@example.com",
      password: "password",
    }),
  });
  await expectMessage("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: user.username, password: "password" }),
  });
  await expectMessage("/auth/logout", { method: "DELETE" });
});

test("logout without a session returns a message", async () => {
  session = {};
  await expectMessage("/auth/logout", { method: "DELETE" });
});

test("pin success paths return a message", async () => {
  await expectMessage("/pin/", {
    headers: { Accept: "application/json", page: 1, perPage: 10 },
  });
  await expectMessage(`/pin/${pin.id}`);
  await expectMessage(`/pin/${pin.id}/`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ comment: "Updated pin" }),
  });

  const form = new FormData();
  form.append("authorid", String(user.id));
  form.append("title", "Created pin");
  form.append("comment", "Created comment");
  form.append("lat", "3");
  form.append("lng", "4");
  await expectMessage("/pin", { method: "POST", body: form });

  await expectMessage(`/pin/${pin.id}`, { method: "DELETE" });
});

test("pin update failures return a message", async () => {
  await expectMessage("/pin/99999/", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ comment: "Missing pin" }),
  });

  const Pins = sequelize.models.Pins;
  const findOne = vi.spyOn(Pins, "findOne").mockRejectedValue(new Error("database failure"));
  try {
    await expectMessage(`/pin/${pin.id}/`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ comment: "Database failure" }),
    });
  } finally {
    findOne.mockRestore();
  }
});

test("comment success and error paths return a message", async () => {
  await expectMessage("/comment/", {
    headers: {
      Accept: "application/json",
      postid: pin.id,
      page: 1,
      perPage: 10,
    },
  });
  await expectMessage(`/comment/${comment.id}`, {
    headers: { Accept: "application/json" },
  });
  await expectMessage("/comment", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      PinParent: pin.id,
      CommentParent: null,
      comment: "Created comment",
    }),
  });
  await expectMessage("/comment", { method: "PUT" });
  await expectMessage(`/comment/${comment.id}`, { method: "DELETE" });
});

test("config success returns a message", async () => {
  await expectMessage("/config/");
});
