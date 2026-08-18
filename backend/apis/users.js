import { requireAdmin, requireAuth } from "../middleware/authorization.js";
import authMiddleware from "../middleware/authentication.js";
import {
  ADMIN_AUTH_LEVEL,
  BASIC_AUTH_LEVEL,
  SUSPENDED_AUTH_LEVEL,
} from "../services/constants.js";
import { DeleteUser } from "../services/user.js";

export default function userRouter(Router, usersModel, sessionStore) {
  const requireAuthMiddleware = requireAuth(usersModel);
  const requireAdminMiddleware = requireAdmin(usersModel);

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
        return res.status(400).json({
          error: true,
          message: "ERROR: NO USERID PROVIDED",
        });
      }

      const user = await usersModel.findByPk(userid);

      if (!user) {
        return res.status(404).json({
          error: true,
          message: "ERROR: USER NOT FOUND",
        });
      }

      res.json({
        message: "User retrieved",
        id: user.id,
        username: user.username,
        authLevel: user.authLevel,
      });
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({
          error: true,
          message: "Internal server error",
        });
      }
    }
  });

  Router.put(
    "/user/:id",
    authMiddleware,
    requireAdminMiddleware,
    async (req, res) => {
      const headers = req.headers;
      const action = headers.action;
      const userid = req.params.id;

      try {
        const user = await usersModel.findByPk(userid);
        if (action == "suspend" && user.authLevel < ADMIN_AUTH_LEVEL) {
          const newAuthLevel = user.authLevel
            ? SUSPENDED_AUTH_LEVEL
            : BASIC_AUTH_LEVEL;

          await user.update({ authLevel: newAuthLevel });
          res.json({
            message: "User updated",
            authLevel: newAuthLevel,
          });
          return;
        } else {
          throw new Error("ERROR: UNAUTHORIZED");
        }
      } catch (error) {
        res.json({
          error: true,
          message: "Unable to update user",
        });
        console.error(error);
      }
    },
  );

  Router.delete(
    "/user/:id",
    authMiddleware,
    requireAuthMiddleware,
    async (req, res) => {
      const sessionUserID = req.user.userid;
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
          requestedUser.id != req.user.userid &&
          actingUser.authLevel < ADMIN_AUTH_LEVEL
        ) {
          throw new Error("ERROR: UNAUTHORIZED");
        }

        await DeleteUser(usersModel, id);

        res.json({
          message: "User deleted",
        });
      } catch (error) {
        res.json({
          error: true,
          message: "Unable to delete user",
        });
        console.error(error);
      }
    },
  );

  return Router;
}
