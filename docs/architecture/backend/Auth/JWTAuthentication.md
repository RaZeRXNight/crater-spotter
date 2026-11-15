# Mobile Authentication (JWT)

## Flow

1. Client sends `POST /api/auth/mobile/login` with credentials.
2. Server validates, signs an access token (15m expiry) and refresh token
(7d expiry), returns both.
3. Client stores tokens in platform secure storage.
4. Every request includes `Authorization: Bearer <accessToken>`.
5. On 401, client uses the refresh token to get a new access token via `GET /api/auth/refresh`.
6. If refresh fails, client re-authenticates via login.

## Token Details

| Token         | Algorithm | Lifetime | Claims                                           |
| ------------- | --------- | -------- | ------------------------------------------------ |
| Access Token  | HS256     | 15m      | `{ userid, username, authLevel, iat, exp }`      |
| Refresh Token | HS256     | 7d       | `{ userid, username, authLevel, iat, exp }`      |

## Register

Not yet implemented for mobile clients.

## Logout

The mobile logout endpoint (`DELETE /api/auth/mobile/logout`) is a no-op. The
client discards the tokens from secure storage. Token revocation is not
implemented - the tokens remain valid until they expire.

## Auth - Mobile (JWT-based)

| Method | Path                  | Auth              | Body                            | Response                                                     |
| ------ | --------------------- | ----------------- | ------------------------------- | ------------------------------------------------------------ |
| POST   | /api/auth/mobile/login | —                 | `{ username, password }`        | `{ accessToken, refreshToken, expiresIn }`                   |
| GET    | /api/auth/mobile       | Bearer token      | —                               | `{ id, username, authLevel }`                                |
| DELETE | /api/auth/mobile/logout | Bearer token      | —                               | `{ message }`                                                |
