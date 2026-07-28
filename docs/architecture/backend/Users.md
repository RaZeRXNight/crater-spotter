# Users

## High-Level Overview

Users stored in `Users` table. `authLevel`: 0=suspended, 1=standard, 2=admin. Passwords bcrypt-hashed on register (admin bootstrap stores plaintext — known issue).

## API Endpoints

All under `/api/user`.

| Method | Path          | Auth          | Body                    | Response                      |
| ------ | ------------- | ------------- | ----------------------- | ----------------------------- |
| GET    | /api/user/    | —             | —                       | `{ message }` placeholder     |
| GET    | /api/user/:id | —             | —                       | `{ id, username, authLevel }` |
| PUT    | /api/user/:id | AdminAuth     | `{ action: "suspend" }` | `{ message, authLevel }`      |
| DELETE | /api/user/:id | self or admin | —                       | `{ message }`                 |

## Known issues

- Potential auth bypass due to async shenanigans (detected by AI).
- `GET /api/user/:id` reads `req.headers.userid` instead of `req.params.id`.
