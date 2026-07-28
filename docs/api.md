# API Reference

All endpoints are mounted under `/api`.

## Auth — Web (Session-based)

| Method | Path               | Auth    | Body                            | Response                             |
| ------ | ------------------ | ------- | ------------------------------- | ------------------------------------ |
| GET    | /api/auth          | session | —                               | `{ id, username, authLevel }` or 401 |
| POST   | /api/auth/register | —       | `{ email, username, password }` | `{ message }`                        |
| POST   | /api/auth/login    | —       | `{ username, password }`        | `{ message }`                        |
| DELETE | /api/auth/logout   | session | —                               | `{ message }`                        |
| DELETE | /api/auth/delete   | session | —                               | `{ message }`                        |
| GET    | /api/auth/refresh  | cookie  | —                               | `{ accessToken }`                    |

## Auth — Mobile (JWT-based)

<!-- Mobile endpoints are defined in apis/mobileAuth.js and wired in routes/api.js -->
<!-- POST /auth/mobile/register is not implemented yet -->

| Method | Path                  | Auth              | Body                            | Response                                                     |
| ------ | --------------------- | ----------------- | ------------------------------- | ------------------------------------------------------------ |
| POST   | /api/auth/mobile/login | —                 | `{ username, password }`        | `{ accessToken, refreshToken, expiresIn }`                   |
| GET    | /api/auth/mobile       | Bearer token      | —                               | `{ id, username, authLevel }`                                |
| DELETE | /api/auth/mobile/logout | Bearer token      | —                               | `{ message }`                                                |

### Mobile Login Flow

1. Client sends `POST /api/auth/mobile/login` with credentials.
2. Server validates, returns `{ accessToken, refreshToken }`.
3. Client stores tokens in platform secure storage (iOS Keychain / Android Keystore).
4. Every subsequent request includes `Authorization: Bearer <accessToken>`.
5. When the access token expires, the client calls the web `/api/auth/refresh` endpoint with the refresh token stored in an httpOnly cookie. <!-- The refresh token cookie is set during mobile login but this path runs through the session-based refresh handler. Refresh token rotation is not yet implemented. -->
6. If refresh fails, the client re-authenticates via login.

### Access & Refresh Token

| Token         | Lifetime | Storage (client)                            |
| ------------- | -------- | ------------------------------------------- |
| Access Token  | 15m      | In-memory / secure storage                  |
| Refresh Token | 7d       | httpOnly cookie (web) or secure storage (mobile) |

<!-- Refresh token rotation on use is not yet implemented. -->

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
