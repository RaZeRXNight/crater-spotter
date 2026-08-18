import { AUTH_LEVEL } from "../services/constants.js";

function unauthorized(res) {
  return res.status(401).json({ message: "Unauthorized" });
}

function forbidden(res) {
  return res.status(403).json({ message: "Forbidden" });
}

function currentIdentity(user) {
  return {
    userid: user.id,
    username: user.username,
    authLevel: user.authLevel,
  };
}

function createAuthorizationMiddleware(usersModel, minimumAuthLevel) {
  return async function authorizationMiddleware(req, res, next) {
    if (!req.user?.userid) {
      return unauthorized(res);
    }

    try {
      const user = await usersModel.findByPk(req.user.userid);

      if (!user) {
        return unauthorized(res);
      }

      if (!Number.isInteger(user.authLevel) || user.authLevel < minimumAuthLevel) {
        return forbidden(res);
      }

      req.user = currentIdentity(user);
      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

export function requireAuth(usersModel) {
  return createAuthorizationMiddleware(usersModel, AUTH_LEVEL.STANDARD);
}

export function requireAdmin(usersModel) {
  return createAuthorizationMiddleware(usersModel, AUTH_LEVEL.ADMIN);
}
