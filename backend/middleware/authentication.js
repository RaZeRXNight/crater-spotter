import { jwtVerification } from "../services/jwt.js";

// Unified auth middleware
// Checks Authorization: Bearer <token> first, falls back to session cookie
export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  // JWT Authenitication for Mobile Applicaitons
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    try {
      const payload = await jwtVerification(token);
      req.user = payload;
      next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    // Session Based Authenitcation for Web Applications
  } else if (req.session && req.session.userid) {
    req.user = {
      userid: req.session.userid,
      username: req.session.username,
      authLevel: req.session.authLevel,
    };

    next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
