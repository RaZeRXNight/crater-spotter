import bcrypt from "bcrypt";
import { checkSchema } from "express-validator";
import { LoginSchema, RegisterSchema } from "../schema/auth.js";
import authMiddleware from "../middleware/authentication.js";
import {
  BCRYPT_SALT_ROUNDS,
  DEFAULT_USER_AUTH_LEVEL,
} from "../services/constants.js";
import { requireAuth } from "../middleware/authorization.js";
import { DeleteUser } from "../services/user.js";

function authenticateSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);

      req.session.userid = user.id;
      req.session.username = user.username;
      req.session.authLevel = user.authLevel;
      req.session.save((saveError) => (saveError ? reject(saveError) : resolve()));
    });
  });
}

function destroySession(session) {
  if (!session?.destroy) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    session.destroy((error) => (error ? reject(error) : resolve()));
  });
}

export default function authRouter(Router, usersModel) {
  const requireAuthMiddleware = requireAuth(usersModel);

  // User DB API
  // Routes
  // User Authentication & Session Handling
  // Authenticate User — protected by authMiddleware (JWT or session)
  Router.get("/auth", authMiddleware, async (req, res) => {
    try {
      const user = await usersModel.findByPk(req.user.userid);

      if (!user) {
        if (req.session) {
          req.session.destroy();
        }
        return res.status(401).json({ message: "ERROR: ACCOUNT NOT FOUND." });
      }

      res.json({
        message: "Authenticated",
        id: req.user.userid,
        username: req.user.username,
        authLevel: req.user.authLevel,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Handle User Registration using Schema Validation, & Express-Session.
  // User Registration
  Router.post(
    "/auth/register",
    checkSchema(RegisterSchema, ["body"]),
    async (req, res) => {
      const body = req.body;

      try {
        // Validate Credentials
        const email = body.email;
        const username = body.username;

        // Encrypt Password
        const password = await bcrypt.hash(body.password, BCRYPT_SALT_ROUNDS);

        // Create User Record
        const newUser = await usersModel.create({
          username: username,
          email: email,
          authLevel: DEFAULT_USER_AUTH_LEVEL,
          password: password,
        });

        await authenticateSession(req, newUser);

        res.json({
          message: `Welcome ${newUser.username}!`,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  // User Login
  Router.post(
    "/auth/login",
    checkSchema(LoginSchema, ["body"]),
    async (req, res) => {
      const body = req.body;

      try {
        // Get User Entry
        const User = await usersModel.findOne({
          where: { username: body.username },
        });

        // Throws if no valid user is found
        if (!User) {
          return res
            .status(404)
            .json({ message: "ERROR: USER DOES NOT EXIST" });
        }

        // Verify if Password Matches then Authenticate Session
        if (await bcrypt.compare(body.password, User.password)) {
          await authenticateSession(req, User);

          // response
          res.json({
            message: `Welcome back ${User.username}!`,
          });
        } else {
          return res.status(401).json({
            error: true,
            message: "ERROR: INCORRECT PASSWORD, Authentication Failed",
          });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  // Logs User Out
  Router.delete("/auth/logout", (req, res) => {
    const session = req.session;

    try {
      if (session.userid) {
        const username = session.username;
        session.destroy();

        res.json({
          message: `Logged Out, Bye ${username}`,
        });
      } else {
        res.json({
          message: "Already Logged Out",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "ERROR: LOGOUT FAILED",
      });
    }
  });

  Router.delete(
    "/auth/delete",
    authMiddleware,
    requireAuthMiddleware,
    async (req, res) => {
      const session = req.session;
      const id = req.user.userid;

      try {
        await DeleteUser(usersModel, id);
        await destroySession(session);

        res.json({
          message: `${id} was deleted.`,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          error: true,
          message: error.message,
        });
      }
    },
  );

  return Router;
}
