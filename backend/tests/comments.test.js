import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import express from "express";
import { Sequelize } from "sequelize";
import Users from "../models/users.js";
import Pins from "../models/pins.js";
import Comments from "../models/comments.js";

process.env.JWT_SECRET = "test-secret";
const { default: commentRouter } = await import("../apis/comments.js");
const { default: authMiddleware } = await import("../middleware/authentication.js");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
  logging: false,
});
const userModel = Users(sequelize);
const pinModel = Pins(sequelize, userModel);
const commentModel = Comments(sequelize);

let app;
let currentSession;
let currentUser;
let user;
let pin;
let server;

function request(body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = globalThis.fetch(
      `http://127.0.0.1:${server.address().port}/comment`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
      },
    );

    request
      .then(async (response) => {
        const text = await response.text();
        const contentType = response.headers.get("content-type") || "";
        resolve({
          status: response.status,
          body:
            contentType.includes("application/json") && text
              ? JSON.parse(text)
              : null,
        });
      })
      .catch(reject);
  });
}

beforeAll(async () => {
  await sequelize.sync({ force: true });

  app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.session = currentSession;
    req.user = currentUser;
    next();
  });
  app.use(authMiddleware);
  app.use(commentRouter(express.Router(), commentModel, userModel));

  server = await new Promise((resolve) => {
    const httpServer = app.listen(0, "127.0.0.1", () => resolve(httpServer));
  });
});

beforeEach(async () => {
  await commentModel.destroy({ where: {}, truncate: true });
  await pinModel.destroy({ where: {}, truncate: true });
  await userModel.destroy({ where: {}, truncate: true });

  user = await userModel.create({
    authLevel: 1,
    username: "commenter",
    email: "commenter@example.com",
    password: "password",
  });
  pin = await pinModel.create({
    authorid: user.id,
    title: "Test pin",
    lat: 1,
    lng: 2,
  });
  currentSession = { userid: user.id };
  currentUser = {
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

test("creates a top-level comment with a null parent", async () => {
  const response = await request({
    PinParent: pin.id,
    CommentParent: null,
    replyLevel: 0,
    comment: "A top-level comment",
  });

  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Comment created");

  const saved = await commentModel.findByPk(response.body.id);
  expect(saved.CommentParent).toBeNull();
  expect(saved.replyLevel).toBe(0);
});

test("defaults an omitted reply level to zero", async () => {
  const response = await request({
    PinParent: pin.id,
    CommentParent: null,
    comment: "A comment without a reply level",
  });

  expect(response.status).toBe(201);
  const saved = await commentModel.findByPk(response.body.id);
  expect(saved.replyLevel).toBe(0);
});

test("rejects a non-integer pin parent with bad request", async () => {
  const response = await request({ PinParent: "invalid", comment: "Comment" });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(true);
});

test("rejects a non-integer comment parent with bad request", async () => {
  const response = await request({
    PinParent: pin.id,
    CommentParent: "invalid",
    comment: "Comment",
  });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(true);
});

test("rejects a non-integer reply level with bad request", async () => {
  const response = await request({
    PinParent: pin.id,
    CommentParent: null,
    replyLevel: "invalid",
    comment: "Comment",
  });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(true);
});

test("rejects a missing comment with bad request", async () => {
  const response = await request({ PinParent: pin.id, CommentParent: null });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(true);
});

test("rejects an empty comment with bad request", async () => {
  const response = await request({
    PinParent: pin.id,
    CommentParent: null,
    comment: "",
  });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(true);
});

test("rejects a null request body with bad request", async () => {
  const response = await request(null);

  expect(response.status).toBe(400);
  expect(response.body).toBeNull();
});

test("rejects an unauthenticated request with unauthorized", async () => {
  currentSession = {};
  currentUser = undefined;
  const response = await request({
    PinParent: pin.id,
    CommentParent: null,
    comment: "Comment",
  });

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Unauthorized");
});

test("returns not found when the pin does not exist", async () => {
  const response = await request({
    PinParent: 99999,
    CommentParent: null,
    comment: "Comment",
  });

  expect(response.status).toBe(404);
  expect(response.body.error).toBe(true);
});

test("returns not found when the parent comment does not exist", async () => {
  const response = await request({
    PinParent: pin.id,
    CommentParent: 99999,
    comment: "Reply",
  });

  expect(response.status).toBe(404);
  expect(response.body.error).toBe(true);
});

test("returns not found when the parent belongs to another pin", async () => {
  const otherPin = await pinModel.create({
    authorid: user.id,
    title: "Other pin",
    lat: 3,
    lng: 4,
  });
  const parent = await commentModel.create({
    authorid: user.id,
    PinParent: otherPin.id,
    CommentParent: null,
    replyLevel: 0,
    comment: "Parent on another pin",
  });

  const response = await request({
    PinParent: pin.id,
    CommentParent: parent.id,
    comment: "Reply",
  });

  expect(response.status).toBe(404);
  expect(response.body.error).toBe(true);
});

test("returns a generic internal error when creation fails", async () => {
  const create = vi
    .spyOn(commentModel, "create")
    .mockRejectedValue(new Error("database secret"));

  try {
    const response = await request({
      PinParent: pin.id,
      CommentParent: null,
      comment: "Comment",
    });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe(true);
    expect(response.body.message).not.toBe("database secret");
  } finally {
    create.mockRestore();
  }
});
