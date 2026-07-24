# Authentication

## High-Level Overview

Session-based auth via `express-session` + `connect-session-sequelize`. Sessions stored in SQLite. Cookie `maxAge`: ~1.67 days.

### Desktop / Web Application

Login/register via POST, subsequent requests carry session cookie.

### Mobile Application

Not implemented.

## API Endpoints

All under `/api/auth`.

| Method | Path               | Auth    | Body                            | Response                             |
| ------ | ------------------ | ------- | ------------------------------- | ------------------------------------ |
| GET    | /api/auth          | session | —                               | `{ id, username, authLevel }` or 401 |
| POST   | /api/auth/register | —       | `{ email, username, password }` | `{ message }`                        |
| POST   | /api/auth/login    | —       | `{ username, password }`        | `{ message }`                        |
| DELETE | /api/auth/logout   | session | —                               | `{ message }`                        |
| DELETE | /api/auth/delete   | session | —                               | `{ message }`                        |

