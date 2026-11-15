# Authentication Architecture

<!--toc:start-->
- [Authentication Architecture](#authentication-architecture)
  - [Overview](#overview)
  - [Web Authentication (Session)](#web-authentication-session)
    - [Flow](#flow)
    - [Session Store](#session-store)
  - [Mobile Authentication (JWT)](#mobile-authentication-jwt)
    - [Flow](#flow-1)
    - [Token Details](#token-details)
    - [Register](#register)
    - [Logout](#logout)
  - [Unified Middleware](#unified-middleware)
  - [Key Files](#key-files)
  - [Environment Variables](#environment-variables)
<!--toc:end-->

## Overview

Two authentication systems coexist:

- **Sessions** (`express-session` + `connect-session-sequelize`) for the web app
  (React).
- **JWT** (`jose`) for mobile clients (Flutter).

A unified middleware (`middleware/authentication.js`) detects which credential is
present and populates `req.user` accordingly, so downstream code doesn't need to
know the source.

## Key Files

| File | Purpose |
| ---- | ------- |
| `services/jwt.js` | Token signing (`signAccessToken`, `signRefreshToken`) and verification (`jwtVerification`) |
| `middleware/authentication.js` | Unified auth middleware (Bearer → session → 401) |
| `middleware/authorization.js` | Role-based guards (`requireAuth`, `requireAdmin`) — stub, not yet implemented |
| `apis/auth.js` | Web auth routes (login, register, logout, refresh) |
| `apis/mobileAuth.js` | Mobile auth routes (login, verify, logout) — register not yet implemented |

## Relevant Documentation

|  File   | Description    |
|--------------- | --------------- |
| `Auth/JWTAuthentication`   | Handler for Mobile Authentication   |
| `Auth/Middleware`   | Middleware for Authentication   |
| `Auth/WebAuthentication`   | Handler for Web App Authentication   |
| `Auth/Authorization`   | Documents Authorization Behavior   |

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

Applied to routes that need authentication. Returns `401` if no credentials
present, `403` if token is invalid/expired.

## Environment Variables

| Variable      | Required | Purpose                         |
| ------------- | -------- | ------------------------------- |
| `SESSION_SECRET` | Yes   | Signs the session cookie        |
| `JWT_SECRET`     | Yes   | Signs access and refresh tokens |

`JWT_SECRET` should be a long, random string. For HS256, at least 32 characters.
