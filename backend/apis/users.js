import VerifyAuthToken from "../middleware/authentication.js";
import { ADMIN_AUTH_LEVEL, BASIC_AUTH_LEVEL, SUSPENDED_AUTH_LEVEL } from "../services/constants.js";
import { forbidden, requireAdminAuthorization, requireBasicAuthorization } from "../middleware/authorization.js";
import { DeleteUser } from "../services/user.js";

export default function userRouter(Router, usersModel, sessionStore) {
  const requireAuthMiddleware = requireBasicAuthorization(usersModel);
  const requireAdminMiddleware = requireAdminAuthorization(usersModel);

  // User DB API
  // Routes
  Router.get("/user/", (req, res) => {
    res.json({ message: "Hello List of Users" });
  });

  Router.get("/user/:id", VerifyAuthToken, requireAuthMiddleware, async (req, res) => {
    const userid = req.params.id;

    try {
      if (!userid) {
        return res.status(404).json({ error: true, message: "ERROR: NO USERID PROVIDED", });
      }

      const user = await usersModel.findByPk(userid);

      if (!user) {
        return res.status(404).json({ error: true, message: "ERROR: USER NOT FOUND" });
      }

      return res.json({ message: "User retrieved", id: user.id, username: user.username, authLevel: user.authLevel });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: true, message: "Internal server error" });
    }
  });

  Router.put("/user/:id", VerifyAuthToken, requireAdminMiddleware, async (req, res) => {
    const headers = req.headers;
    const action = headers.action;
    const userid = req.params.id;

    try {
      const user = await usersModel.findByPk(userid);
      if (action == "suspend" && user.authLevel < ADMIN_AUTH_LEVEL) {
        const newAuthLevel = user.authLevel ? SUSPENDED_AUTH_LEVEL : BASIC_AUTH_LEVEL;

        await user.update({ authLevel: newAuthLevel });
        return res.json({ message: "User updated", authLevel: newAuthLevel });
      } else {
        return forbidden(res)
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: true, message: "Internal Server Error", });
    }
  },
  );

  Router.delete("/user/:id", VerifyAuthToken, requireAuthMiddleware,
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
        if (requestedUser.id != req.user.userid && actingUser.authLevel < ADMIN_AUTH_LEVEL) {
          return forbidden(res)
        }

        await DeleteUser(usersModel, id);

        res.json({ message: "User deleted" });
      } catch (error) {
        res.json({ error: true, message: "Unable to delete user" });
        console.error(error);
      }
    },
  );

  return Router;
}
