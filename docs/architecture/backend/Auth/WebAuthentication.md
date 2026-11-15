# Web Authentication (Session)

## Flow

1. User submits credentials to `POST /api/auth/login`.
2. Server validates, sets `req.session.userid`, `req.session.username`, `req.session.authLevel`.
3. `express-session` sends an httpOnly `connect.sid` cookie.
4. Browser sends cookie automatically on every request.
5. Protected routes read `req.session` (legacy) or `req.user` (via middleware).

## Session Store

- Stored in SQLite via `connect-session-sequelize`.
- Cookie `maxAge`: ~1.67 days.
