# API Layer

## Overview

A single `api()` function wraps `axios` and provides toast notifications on success/error. All API calls go through this function. No request interceptors, no response interceptors, no base URL configuration.

## `api()` — `src/api.js`

**Signature:**

```js
export default async function api({ url, method = "GET", headers = {}, body = null, silent = false })
```

**Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `url` | String | — | Full URL path (e.g. `"/api/pin"`). Typically relative — same origin. |
| `method` | String | `"GET"` | HTTP method. |
| `headers` | Object | `{}` | Custom headers merged into the request. |
| `body` | Any | `null` | Request body. Passed as `data` to axios. Can be a plain object, FormData, etc. |
| `silent` | Boolean | `false` | Suppresses toast messages. Used by `getUser()` when calling `/api/auth` (expected to 401 when logged out). |

**Returns:**

```js
{ err: null, data: response.data }   // on success
{ err: message, data: null }         // on failure
```

**Behavior:**
- On success with `response.data.error === true`: shows `toast.error()` with `response.data.message`.
- On success with no error: shows `toast.success()` if `response.data.message` is a non-empty string.
- On network/HTTP error: shows `toast.error()` with `error.response?.data?.message || error.message`.

## Endpoints Consumed

The frontend calls the following backend endpoints:

| Method | URL | Called From | Notes |
|--------|-----|-------------|-------|
| GET | `/api/config` | `RootLoader` | Fetches `GOOGLE_MAPS_API_KEY` |
| GET | `/api/auth` | `getUser()` | Current session check. `silent: true` — no toast on 401. |
| POST | `/api/auth/login` | `LoginForm` | Session-based login |
| POST | `/api/auth/register` | `RegisterForm` | Create account |
| DELETE | `/api/auth/logout` | `Logout`, `HandleLogout` | Destroy session |
| DELETE | `/api/auth/delete` | `HandleUserDeletion` | Delete own account |
| GET | `/api/pin/` | `getPins`, `getUserPins` | Paginated pin list. Sends `perPage`, `page`, optionally `userid` or `Authorization: User` as headers. |
| GET | `/api/pin/:id` | `getPin`, `PinDataLoader` | Single pin detail |
| POST | `/api/pin` | `CreatePin` | Multipart form (title, authorid, comment, lat, lng, image) |
| PUT | `/api/pin/:id` | `EditPin` | JSON body: `{ title, authorid, comment, coordinates }` |
| DELETE | `/api/pin/:id` | `Card`, `DeletePost` | Delete pin |
| GET | `/api/comment/` | `getComments` | Paginated comments. Sends `postid`, `perPage`, `page` as headers. |
| POST | `/api/comment` | `HandleCommentFormSubmission` | JSON: `{ authorid, PinParent, comment, CommentParent?, replyLevel? }` |
| DELETE | `/api/comment/:id` | `Comment` | Delete comment |
| GET | `/api/user/:id` | `getUser`, `UserProfileLoader` | User profile data |
| PUT | `/api/user/:id` | `HandleProfileSuspension` | Suspend/unsuspend. Sends `action: "suspend"` + JSON body. |
| DELETE | `/api/user/:id` | `HandleProfileDeletion` | Delete user |

## Header Conventions

The frontend sends pagination parameters as **HTTP headers**, not query parameters, matching the backend's non-standard design:

| Header | Value | Used By |
|--------|-------|---------|
| `perPage` | Number | `getPins`, `getUserPins`, `getComments` |
| `page` | Number | `getPins`, `getUserPins`, `getComments` |
| `postid` | Number | `getComments` |
| `userid` | Number | `getPins` (filters by author) |
| `Authorization` | `"User"` | `getUserPins` (non-standard — not Bearer) |
| `action` | `"suspend"` | `HandleProfileSuspension` |
