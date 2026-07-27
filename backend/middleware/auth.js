import jwt from "jsonwebtoken";

// Unified auth middleware
// Checks Authorization: Bearer <token> first, falls back to session cookie
export default function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expirted token" });
      }

      req.user = decoded;
      next();
    });
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
