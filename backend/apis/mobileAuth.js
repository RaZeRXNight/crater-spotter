import bcrypt from "bcrypt";
import { checkSchema } from "express-validator";
import { LoginSchema, RegisterSchema } from "../schema/auth.js";
import { signAccessToken, signRefreshToken } from "../services/jwt.js";
import {
  ACCESS_TOKEN_EXPIRY,
  BCRYPT_SALT_ROUNDS,
  DEFAULT_USER_AUTH_LEVEL,
} from "../services/constants.js";

export default function mobileAuthRouter(Router, usersModel) {
  Router.get("/auth/mobile/refresh", async (req, res) => {
    const token = req.cookies?.refreshtoken;

    if (!token) {
      return res.status(401).json({
        error: true,
        message: "Refresh token missing",
      });
    }

    try {
      const payload = await jwtVerification(token);
      req.user = payload;

      const newAccessToken = await signAccessToken({
        userid: payload.userid,
        username: payload.username,
        authLevel: payload.authLevel,
      });

      return res.json({ accessToken: newAccessToken });
    } catch (error) {
      return res.status(403).json({
        error: true,
        message: "Invalid or expired token",
      });
    }
  });

  // Mobile Login — returns JWT instead of setting session
  Router.post(
    "/auth/mobile/login",
    checkSchema(LoginSchema, ["body"]),
    async (req, res) => {
      const body = req.body;

      try {
        const User = await usersModel.findOne({
          where: { username: body.username },
        });

        if (!User) {
          res.status(401).json({
            error: true,
            message: "Invalid username or password",
          });
          return;
        }

        if (!(await bcrypt.compare(body.password, User.password))) {
          res.status(401).json({
            error: true,
            message: "Invalid username or password",
          });
          return;
        }

        const claims = {
          userid: User.id,
          username: User.username,
          authLevel: User.authLevel,
        };

        const accessToken = await signAccessToken(claims);
        const refreshToken = await signRefreshToken(claims);

        res.json({
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresIn: ACCESS_TOKEN_EXPIRY,
        });
      } catch (error) {
        console.error(error);
      }
    },
  );

  // Mobile Register — creates account and returns JWT
  Router.post(
    "/auth/mobile/register",
    checkSchema(RegisterSchema, ["body"]),
    async (req, res) => {
      const body = req.body;

      try {
        const password = await bcrypt.hash(body.password, BCRYPT_SALT_ROUNDS);

        const newUser = await usersModel.create({
          username: body.username,
          email: body.email,
          authLevel: DEFAULT_USER_AUTH_LEVEL,
          password: password,
        });

        const claims = {
          userid: newUser.id,
          username: newUser.username,
          authLevel: newUser.authLevel,
        };

        const accessToken = await signAccessToken(claims);
        const refreshToken = await signRefreshToken(claims);

        res.json({
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresIn: ACCESS_TOKEN_EXPIRY,
        });
      } catch (error) {
        console.error(error);
      }
    },
  );

  // Mobile Logout — client-side token discard; endpoint exists for API symmetry
  Router.delete("/auth/mobile/logout", async (req, res) => {
    // Token revocation deferred to roadmap — client discards the token
    res.json({
      message: "Logout successful",
    });
  });

  return Router;
}
