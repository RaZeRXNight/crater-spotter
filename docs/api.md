# API Reference

All endpoints are mounted under `/api`. Session-based auth via cookie.

## Auth

| Method | Path               | Auth    | Body                            | Response                             |
| ------ | ------------------ | ------- | ------------------------------- | ------------------------------------ |
| GET    | /api/auth          | session | —                               | `{ id, username, authLevel }` or 401 |
| POST   | /api/auth/register | —       | `{ email, username, password }` | `{ message }`                        |
| POST   | /api/auth/login    | —       | `{ username, password }`        | `{ message }`                        |
| DELETE | /api/auth/logout   | session | —                               | `{ message }`                        |
| DELETE | /api/auth/delete   | session | —                               | `{ message }`                        |

## Pins

| Method | Path         | Auth      | Body                                                            | Response                              |
| ------ | ------------ | --------- | --------------------------------------------------------------- | ------------------------------------- |
| GET    | /api/pin/    | —         | —                                                               | `{ rows, count }`                     |
| GET    | /api/pin/:id | —         | —                                                               | `{ message: { ...pin, authorName } }` |
| POST   | /api/pin     | BasicAuth | multipart: title, authorid, comment, lat, lng, image (optional) | `{ message, error: false, id }`       |
| PUT    | /api/pin/:id | BasicAuth | `{ comment }`                                                   | `{ message }`                         |
| DELETE | /api/pin/:id | BasicAuth | —                                                               | `{ message }`                         |

## Comments

| Method | Path             | Auth      | Body                                                            | Response                                     |
| ------ | ---------------- | --------- | --------------------------------------------------------------- | -------------------------------------------- |
| GET    | /api/comment/    | —         | —                                                               | `{ message: { rows, count } }`               |
| GET    | /api/comment/:id | —         | —                                                               | `{ message: { rows, count } }` (ignores :id) |
| POST   | /api/comment     | BasicAuth | `{ authorid, PinParent, comment, CommentParent?, replyLevel? }` | `{ id, comment }`                            |
| DELETE | /api/comment/:id | BasicAuth | —                                                               | `{ message }`                                |

## Users

| Method | Path          | Auth          | Body                    | Response                      |
| ------ | ------------- | ------------- | ----------------------- | ----------------------------- |
| GET    | /api/user/    | —             | —                       | `{ message }` placeholder     |
| GET    | /api/user/:id | —             | —                       | `{ id, username, authLevel }` |
| PUT    | /api/user/:id | AdminAuth     | `{ action: "suspend" }` | `{ message, authLevel }`      |
| DELETE | /api/user/:id | self or admin | —                       | `{ message }`                 |

## Config

| Method | Path         | Auth | Body | Response                  |
| ------ | ------------ | ---- | ---- | ------------------------- |
| GET    | /api/config/ | —    | —    | `{ GOOGLE_MAPS_API_KEY }` |

## Auth levels

- `0` — suspended
- `1` — standard user (BasicAuth)
- `2` — admin (AdminAuth)

## Pagination

All list endpoints use **HTTP headers** (not query params): `Perpage`, `Page`, `Order` (ASC/DESC).

## Images

Uploaded via `multipart/form-data` to POST `/api/pin`. Accepted types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`. Files stored at `STORAGE_PATH`, served under `/public/storage/`.
