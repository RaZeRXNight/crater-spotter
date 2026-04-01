import bcrypt from "bcrypt";
import { checkSchema, body } from "express-validator";

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

  Router.get("/user/:id", (req, res) => {
    res.json({
      message: "Get User Information by ID",
    });
  });

  Router.put("/user/:id", (req, res) => {
    res.json({
      message: "Change user information",
    });
  });

  Router.delete("/user/:id", (req, res) => {
    res.json({
      message: "Delete User",
    });
  });

  // User Authentication & Session Handling
  // Authenticate User
  Router.get("/auth", async (req, res) => {
    const session = req.session;

    if (session.userid) {
      res.json({
        id: session.userid,
        username: session.username,
      });
    } else {
      res.status(401).send("ERROR: Unauthorized.");
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
          console.log(body.password);
          throw new Error("No Password");
        }

        // Create User Record
        const newUser = await usersModel.create({
          username: username,
          email: email,
          password: password,
        });

        session.userid = newUser.id;
        session.username = newUser.username;

        res.json({
          message: `Successfully Logged In, Welcome ${session.username}`,
        });
      } catch (error) {
        console.log(error);
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
      console.log(body);

      try {
        // Get User Entry
        const User = await usersModel.findOne({
          where: { username: body.username },
        });

        // Verify if Password Matches then Authenticate Session
        if (bcrypt.compare(body.password, User.password)) {
          session.userid = User.id;
          session.username = User.username;

          res.json({
            message: `Successfully Logged In, Welcome ${session.username}`,
          });
        } else {
          throw new Error("ERROR: INCORRECT PASSWORD, Authentication Failed");
        }
      } catch (error) {
        console.log(error);
        res.status(401).send("ERROR: Authentication Failure");
      }
    },
  );

  // Logs User Out
  Router.delete("/auth/logout", (req, res) => {
    const session = req.session;
    if (session.userid) {
      session.destroy();

      res.json({
        message: `Logged Out, Bye ${session.username}`,
      });
    }
  });

  Router.delete("/auth/delete", async (req, res) => {
    const session = req.session;
    const id = session.userid;

    try {
      // Perform action to delete
      const query = await usersModel.findOne({ where: { id: id } });

      if (query.id != session.userid) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      usersModel.destroy({
        where: {
          id: id,
        },
      });

      session.destroy();

      res.json({
        message: `${id} was deleted.`,
      });
    } catch (error) {
      res.json({
        error,
        message: "Delete pin",
      });
    }
  });

  return Router;
}
