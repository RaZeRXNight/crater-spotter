# Authentication Architecture

## Overview

Two authentication systems coexist:

- **Sessions** (`express-session` + `connect-session-sequelize`) for the web app (React).
- **JWT** (`jose`) for mobile clients (Flutter).

A unified middleware (`middleware/authentication.js`) detects which credential is present and populates `req.user` accordingly, so downstream code doesn't need to know the source.

## Web Authentication (Session)

### Flow

1. User submits credentials to `POST /api/auth/login`.
2. Server validates, sets `req.session.userid`, `req.session.username`, `req.session.authLevel`.
3. `express-session` sends an httpOnly `connect.sid` cookie.
4. Browser sends cookie automatically on every request.
5. Protected routes read `req.session` (legacy) or `req.user` (via middleware).

### Session Store

- Stored in SQLite via `connect-session-sequelize`.
- Cookie `maxAge`: ~1.67 days.

## Mobile Authentication (JWT)

### Flow

1. Client sends `POST /api/auth/mobile/login` with credentials.
2. Server validates, signs an access token (15m expiry) and refresh token (7d expiry), returns both.
3. Client stores tokens in platform secure storage.
4. Every request includes `Authorization: Bearer <accessToken>`.
5. On 401, client uses the refresh token to get a new access token via `GET /api/auth/refresh`.
6. If refresh fails, client re-authenticates via login.

### Token Details

| Token         | Algorithm | Lifetime | Claims                                           |
| ------------- | --------- | -------- | ------------------------------------------------ |
| Access Token  | HS256     | 15m      | `{ userid, username, authLevel, iat, exp }`      |
| Refresh Token | HS256     | 7d       | `{ userid, username, authLevel, iat, exp }`      |

<!-- Refresh token rotation on use is not yet implemented. -->
<!-- The refresh endpoint currently uses a cookie-based flow designed for web sessions. Mobile clients store the refresh token client-side and should send it in the request body or Authorization header — this path is not yet implemented. -->

### Register

Not yet implemented for mobile clients.
<!-- POST /auth/mobile/register should mirror the web register endpoint but return tokens instead of setting a session. -->

### Logout

The mobile logout endpoint (`DELETE /api/auth/mobile/logout`) is a no-op. The client discards the tokens from secure storage. Token revocation is not implemented — the tokens remain valid until they expire.

<!-- Token revocation via denylist is not yet implemented. -->

## Unified Middleware

`middleware/authentication.js` handles both paths:

```
Request
  │
  ├─ Authorization: Bearer <token>
  │   └─ jwtVerification(token) → req.user = payload
  │
  └─ Cookie: connect.sid=<id> (and req.session.userid exists)
      └─ req.user = { userid, username, authLevel }
```

Sets `req.user` with a consistent shape: `{ userid, username, authLevel }`.

Applied to routes that need authentication. Returns `401` if no credentials present, `403` if token is invalid/expired.

<!-- The legacy BasicAuth and AdminAuth helpers in services/admin.js still check req.session directly. They should be updated to read from req.user instead. -->

## Key Files

| File | Purpose |
| ---- | ------- |
| `services/jwt.js` | Token signing (`signAccessToken`, `signRefreshToken`) and verification (`jwtVerification`) |
| `middleware/authentication.js` | Unified auth middleware (Bearer → session → 401) |
| `middleware/authorization.js` | Role-based guards (`requireAuth`, `requireAdmin`) — stub, not yet implemented |
| `apis/auth.js` | Web auth routes (login, register, logout, refresh) |
| `apis/mobileAuth.js` | Mobile auth routes (login, verify, logout) — register not yet implemented |
| `routes/api.js` | Router wiring |

## Environment Variables

| Variable      | Required | Purpose                         |
| ------------- | -------- | ------------------------------- |
| `SESSION_SECRET` | Yes   | Signs the session cookie        |
| `JWT_SECRET`     | Yes   | Signs access and refresh tokens |

`JWT_SECRET` should be a long, random string. For HS256, at least 32 characters.

## Auth Levels

- `0` — suspended
- `1` — standard user (BasicAuth)
- `2` — admin (AdminAuth)
