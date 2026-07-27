# Authentication

## High-Level Overview

Session-based auth via `express-session` + `connect-session-sequelize`. Session-based
stored in SQLite. Cookie `maxAge`: ~1.67 days.

### Desktop / Web Application

Login/register via POST, subsequent requests carry session cookie.

### Mobile Application

Login/Register via POST, Receive a JWT token, every request uses this token.

### Middleware

`middleware/auth.js` is deployed to sort through login/register
requests. This middleware checks for a session or an Authorization: Bearer header.
This process determines whether or not the user is signing in with the mobile app
or with the web app. The outcome is a `req.auth` field in the request that acts
as the user's "wristband".

## API Endpoints

All under `/api/auth`.

| Method | Path               | Auth    | Body                            | Response                             |
| ------ | ------------------ | ------- | ------------------------------- | ------------------------------------ |
| GET    | /api/auth          | session | —                               | `{ id, username, authLevel }` or 401 |
| POST   | /api/auth/register | —       | `{ email, username, password }` | `{ message }`                        |
| POST   | /api/auth/login    | —       | `{ username, password }`        | `{ message }`                        |
| DELETE | /api/auth/logout   | session | —                               | `{ message }`                        |
| DELETE | /api/auth/delete   | session | —                               | `{ message }`                        |

## Environment

A JWT_SECRET variable is injected into the backend which is paired with the
Mobile Application Authentication.
