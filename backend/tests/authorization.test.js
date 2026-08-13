import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { Sequelize } from "sequelize";
import Users from "../models/users.js";
import { AUTH_LEVEL } from "../services/constants.js";
import { requireAdmin, requireAuth } from "../middleware/authorization.js";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
  logging: false,
});
const usersModel = Users(sequelize);

function responseDouble() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return { res };
}

async function createUser(authLevel) {
  return usersModel.create({
    authLevel,
    username: `user-${authLevel}-${Date.now()}-${Math.random()}`,
    email: `${authLevel}-${Date.now()}-${Math.random()}@example.com`,
    password: "password",
  });
}

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await usersModel.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("requireAuth", () => {
  test("rejects a missing identity with 401", async () => {
    const response = responseDouble();
    const next = vi.fn();

    await requireAuth(usersModel)({}, response.res, next);

    expect(response.res.status).toHaveBeenCalledWith(401);
    expect(response.res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects a deleted identity with 401", async () => {
    const response = responseDouble();
    const next = vi.fn();

    await requireAuth(usersModel)({ user: { userid: 9999 } }, response.res, next);

    expect(response.res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects a suspended current user with 403", async () => {
    const user = await createUser(AUTH_LEVEL.SUSPENDED);
    const response = responseDouble();
    const next = vi.fn();

    await requireAuth(usersModel)(
      { user: { userid: user.id, authLevel: AUTH_LEVEL.ADMIN } },
      response.res,
      next,
    );

    expect(response.res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("refreshes req.user from the current standard user record", async () => {
    const user = await createUser(AUTH_LEVEL.STANDARD);
    const req = {
      user: { userid: user.id, username: "stale", authLevel: AUTH_LEVEL.ADMIN },
    };
    const response = responseDouble();
    const next = vi.fn();

    await requireAuth(usersModel)(req, response.res, next);

    expect(req.user).toEqual({
      userid: user.id,
      username: user.username,
      authLevel: AUTH_LEVEL.STANDARD,
    });
    expect(next).toHaveBeenCalledOnce();
  });
});

describe("requireAdmin", () => {
  test("rejects a standard user with 403", async () => {
    const user = await createUser(AUTH_LEVEL.STANDARD);
    const response = responseDouble();
    const next = vi.fn();

    await requireAdmin(usersModel)({ user: { userid: user.id } }, response.res, next);

    expect(response.res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("refreshes stale claims for an administrator", async () => {
    const user = await createUser(AUTH_LEVEL.ADMIN);
    const req = { user: { userid: user.id, authLevel: AUTH_LEVEL.STANDARD } };
    const response = responseDouble();
    const next = vi.fn();

    await requireAdmin(usersModel)(req, response.res, next);

    expect(req.user.authLevel).toBe(AUTH_LEVEL.ADMIN);
    expect(next).toHaveBeenCalledOnce();
  });
});
