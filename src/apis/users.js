import bcrypt from "bcrypt";
import { checkSchema } from "express-validator";
import {
  AdminAuth,
  BasicAuth,
  CheckAndMakeDefaultAdminAccount,
} from "../services/admin.js";
import { Op } from "sequelize";

const saltRounds = 12;

const LoginSchema = {
  email: { isEmail: true },
  password: { isLength: { options: { min: 8, max: 52 } } },
};

const RegisterSchema = {
  email: { isEmail: true },
  username: { isLength: { min: 3, max: 52 } },
  password: { isLength: { options: { min: 8, max: 52 } } },
};

export default function userRouter(Router, usersModel, sessionStore) {
  // User DB API
  // Routes
  Router.get("/user/", (req, res) => {
    res.json({
      message: "Hello List of Users",
    });
  });

  Router.get("/user/:id", async (req, res) => {
    const userid = req.headers.userid;

    try {
      if (!userid) {
        res.status(400).send("Invalid user id");
        throw new Error("ERROR: NO USERID PROVIDED");
      }

      const user = await usersModel.findByPk(userid);

      if (!user) {
        res.status(404).send("ERROR: USER NOT FOUND");
        throw new Error("ERROR: USER NOT FOUND");
      }

      res.json({
        id: user.id,
        username: user.username,
        authLevel: user.authLevel,
      });
    } catch (error) {
      console.error(error);
    }
  });

  Router.put("/user/:id", async (req, res) => {
    const session = req.session;
    const headers = req.headers;
    const action = headers.action;
    const userid = req.params.id;

    try {
      const auth = await BasicAuth(usersModel.sequelize, session);
      const adminAuth = await AdminAuth(usersModel.sequelize, session);

      if (!auth) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      const user = await usersModel.findByPk(userid);
      if (adminAuth && action == "suspend" && user.authLevel < 2) {
        const newAuthLevel = user.authLevel ? 0 : 1;

        const updatedUser = await user.update({ authLevel: newAuthLevel });
        res.json({
          message: "Successfully Updated User",
          authLevel: newAuthLevel,
        });
        return;
      } else {
        throw new Error("ERROR: UNAUTHORIZED");
      }
    } catch (error) {
      res.json({
        error: true,
        message: error.message,
      });
      console.error(error);
    }
  });

  Router.delete("/user/:id", async (req, res) => {
    const session = req.session;
    const sessionUserID = session.userid;
    const id = req.params.id;

    // Models
    const sessionModel = usersModel.sequelize.models.Session;

    try {
      // Perform action to delete
      const requestedUser = await usersModel.findByPk(id);
      const actingUser = await usersModel.findByPk(sessionUserID);

      if (!requestedUser) {
        throw new Error("ERROR: USER DOES NOT EXIST");
      }

      // Check if user is admin or authenticated user.
      if (requestedUser.id != session.userid && actingUser.authLevel < 2) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      // Deletes all the user's comments
      const commentModel = usersModel.sequelize.models.Comments;
      const deletedComments = await commentModel.destroy({
        where: { authorid: id },
      });

      const deletedUser = await usersModel.destroy({
        where: {
          id: id,
        },
      });

      res.json({
        message: `${id} was deleted.`,
      });
    } catch (error) {
      res.json({
        error: true,
        message: error.message,
      });
      console.error(error);
    }
  });

  // User Authentication & Session Handling
  // Authenticate User
  Router.get("/auth", async (req, res) => {
    const session = req.session;
    const userid = session.userid;

    try {
      const user = await usersModel.findByPk(session.userid);

      if (userid && !user) {
        session.destroy();
        res.status(401).send("ERROR: ACCOUNT NOT FOUND.");
        throw new Error("ERROR: ACCOUNT NOT FOUND");
      }

      if (session.userid) {
        res.json({
          id: session.userid,
          username: session.username,
          authLevel: session.authLevel,
        });
      } else {
        res.status(401).send("ERROR: Unauthorized.");
      }
    } catch (error) {
      console.error(error);
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
        const password = await bcrypt
          .hash(body.password, saltRounds)
          .then(function (hash) {
            return hash;
          });

        if (!password) {
          throw new Error("No Password");
        }

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
          res.status(404).json({ message: "ERROR: USER DOES NOT EXIST" });
          throw new Error("ERROR: USER DOES NOT EXIST");
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
          res
            .status(401)
            .send("ERROR: INCORRECT PASSWORD, Authentication Failed");
          throw new Error("ERROR: INCORRECT PASSWORD, Authentication Failed");
        }
      } catch (error) {
        console.error(error);
      }
    },
  );

  // Logs User Out
  Router.delete("/auth/logout", (req, res) => {
    const session = req.session;

    try {
      if (session.userid) {
        session.destroy();

        res.json({
          message: `Logged Out, Bye ${session.username}`,
        });
      }
    } catch (error) {
      console.error(error);
      res.json({
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

      if (query.id != session.userid) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      const commentModel = usersModel.sequelize.models.Comments;
      const deletedComments = await commentModel.destroy({
        where: { PinParent: id },
      });

      const userDeletion = await query.destroy({ where: { id: id } });
      await session.destroy();

      res.json({
        message: `${id} was deleted.`,
      });
    } catch (error) {
      console.error(error);
      res.json({
        error: true,
        message: error.message,
      });
    }
  });

  return Router;
}
