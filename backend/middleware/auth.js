import jwt from "jsonwebtoken";

// Unified auth middleware
// Checks Authorization: Bearer <token> first, falls back to session cookie
export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // JWT path
    // Verify token, attach decoded payload to req.auth, call next()
    // On failure, respond 401
  } else if (req.session && req.session.userid) {
    // Session path — attach session data to req.auth for unified access
    // call next()
  } else {
    // No credentials — respond 401
  }
}