# Authorization

Authentication establishes `req.user` from a session or Bearer JWT. Protected
mutations use `requireAuth(usersModel)` or `requireAdmin(usersModel)`, which
reload the current user before allowing the request to continue.

Auth levels are `0` suspended, `1` standard, and `2` admin. Missing or deleted
identities receive `401`; suspended or insufficient identities receive `403`.
Resource ownership checks remain in route handlers.
