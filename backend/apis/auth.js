import bcrypt from "bcrypt";
import { checkSchema } from "express-validator";
import { LoginSchema, RegisterSchema } from "../schema/auth.js";
import { jwtVerification, signAccessToken } from "../services/jwt.js";
import authMiddleware from "../middleware/authentication.js";

const saltRounds = 12;

export default function authRouter(Router, usersModel) {
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
      const session = req.session;

      try {
        // Validate Credentials
        const email = body.email;
        const username = body.username;

        // Encrypt Password
        const password = await bcrypt.hash(body.password, saltRounds);

        // Create User Record
        const newUser = await usersModel.create({
          username: username,
          email: email,
          authLevel: 1,
          password: password,
        });

        session.userid = newUser.id;
        session.username = newUser.username;
        session.authLevel = newUser.authLevel;

        res.json({
          message: `Welcome ${session.username}!`,
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
      const session = req.session;

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
          session.userid = User.id;
          session.username = User.username;
          session.authLevel = User.authLevel;

          // response
          res.json({
            message: `Welcome back ${session.username}!`,
          });
        } else {
          return res
            .status(401)
            .send("ERROR: INCORRECT PASSWORD, Authentication Failed");
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
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "ERROR: LOGOUT FAILED",
      });
    }
  });

  Router.delete("/auth/delete", async (req, res) => {
    const session = req.session;
    const id = session.userid;

    try {
      // Perform action to delete
      const query = await usersModel.findByPk(id);

      if (!query) {
        throw new Error("ERROR: USER DOES NOT EXIST");
      }

      const commentModel = usersModel.sequelize.models.Comments;
      const deletedComments = await commentModel.destroy({
        where: { PinParent: id },
      });

      const userDeletion = await query.destroy();
      await session.destroy();

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
  });

  return Router;
}
