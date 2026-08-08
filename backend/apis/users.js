import {
  AdminAuth,
  BasicAuth,
  CheckAndMakeDefaultAdminAccount,
} from "../services/admin.js";
import { Op } from "sequelize";
import {
  ADMIN_AUTH_LEVEL,
  BASIC_AUTH_LEVEL,
  SUSPENDED_AUTH_LEVEL,
} from "../services/constants.js";
import { DeleteUser } from "../services/user.js";

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
      if (
        adminAuth &&
        action == "suspend" &&
        user.authLevel < ADMIN_AUTH_LEVEL
      ) {
        const newAuthLevel = user.authLevel
          ? SUSPENDED_AUTH_LEVEL
          : BASIC_AUTH_LEVEL;

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

    try {
      // Perform action to delete
      const requestedUser = await usersModel.findByPk(id);
      const actingUser = await usersModel.findByPk(sessionUserID);

      if (!requestedUser) {
        throw new Error("ERROR: USER DOES NOT EXIST");
      }

      // Check if user is admin or authenticated user.
      if (
        requestedUser.id != session.userid &&
        actingUser.authLevel < ADMIN_AUTH_LEVEL
      ) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      await DeleteUser(usersModel, id);

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

  return Router;
}
