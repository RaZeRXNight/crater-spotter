# Back-End Architecture

## High-Level Overview

Node.js (Express) + Sequelize (SQLite). Sessions via `express-session` + `connect-session-sequelize`. Auth levels: 0=suspended, 1=user, 2=admin. Single entrypoint `server.js` serves built React app from `frontend/dist`, mounts API under `/api`, serves uploads from `STORAGE_PATH` as static files.

## Resource Groups

| Resource | File |
|----------|------|
| Authentication | [Authentication.md](backend/Authentication.md) |
| Pins | [Pins.md](backend/Pins.md) |
| Comments | [Comments.md](backend/Comments.md) |
| Users | [Users.md](backend/Users.md) |
| Config | `/api/config/` — exposes `GOOGLE_MAPS_API_KEY` |

## Notable Quirks

- SQLite only (`dialect: "sqlite"`), `DB_*` env vars ignored.
- No migrations — models call `.sync()` on startup.
- Admin bootstrap creates `admin`/`password` in **plaintext** (bcrypt not applied).
- Pin and comment pagination uses HTTP headers (`Perpage`, `Page`, `Order`), not query params. `backend/services/validation.js` validates the values using defaults and limits from `backend/services/constants.js`: page `1`–`100`, per-page `1`–`10`.
- `GET /api/comment/:id` and `GET /api/user/:id` ignore path param, read from headers.
- `DELETE /api/auth/logout` reads `session.username` *before* `session.destroy()` (captured in local variable).
