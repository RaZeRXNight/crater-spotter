// Authorization middleware
// Checks req.user (set by authentication middleware) against required authLevel
// authLevel: 1 = basic user, 2 = admin

export function requireAuth(req, res, next) {
  // Verify authenticated user exists with at least basic access
}

export function requireAdmin(req, res, next) {
  // Verify authenticated user has admin-level access (authLevel >= 2)
}