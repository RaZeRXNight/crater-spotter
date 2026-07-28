import bcrypt from "bcrypt";
import { checkSchema } from "express-validator";
import { LoginSchema, RegisterSchema } from "../schema/auth.js";
import { signAccessToken, signRefreshToken } from "../services/jwt.js";

const saltRounds = 12;

export default function mobileAuthRouter(Router, usersModel) {
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
          res.status(404).json({ message: "ERROR: USER DOES NOT EXIST" });
          return;
        }

        if (await bcrypt.compare(body.password, User.password)) {
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
            expiresIn: "15m",
          });
        } else {
          res
            .status(401)
            .send("ERROR: INCORRECT PASSWORD, Authentication Failed");
        }
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
        const password = await bcrypt.hash(body.password, saltRounds);

        const newUser = await usersModel.create({
          username: body.username,
          email: body.email,
          authLevel: 1,
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
          expiresIn: "15m",
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
      message: "Logged Out, Bye",
    });
  });

  return Router;
}
