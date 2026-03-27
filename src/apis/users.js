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

function ValidateLogin() {}

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

  Router.post(
    "/user/register",
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

  return Router;
}
