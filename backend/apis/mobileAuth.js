import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkSchema } from "express-validator";
import { LoginSchema } from "../schema/auth.js";

export default function mobileAuthRouter(Router, usersModel) {
  // Mobile Authentication Routes
  // Handles JWT-based auth for Flutter / native clients

  // Mobile Login — returns JWT instead of setting session
  Router.post(
    "/auth/mobile/login",
    checkSchema(LoginSchema, ["body"]),
    async (req, res) => {
      // Validate credentials
      // If valid, sign and return a JWT
      // If invalid, return 401
    },
  );

  // Mobile Logout — client-side token discard; endpoint exists for API symmetry
  Router.delete("/auth/mobile/logout", async (req, res) => {
    // Stateless JWT — nothing to invalidate server-side
    // Endpoint exists so the mobile app can call it before discarding the token
  });

  // Verify JWT — returns user info from the token
  Router.get("/auth/mobile", async (req, res) => {
    // Reads Authorization: Bearer <token>
    // Verifies and decodes, returns { id, username, authLevel }
    // On failure returns 401
  });

  return Router;
}