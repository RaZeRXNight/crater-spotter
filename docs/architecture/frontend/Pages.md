# Pages

## Overview

Six page components, each in `src/pages/`. Pages read data from route loaders (`useLoaderData`) and parent outlet context (`useOutletContext`). Auth-gated pages use `authMiddleware` at the route level.

## Auth — `src/pages/Auth.jsx`

**Exports:** `Auth` (default)

**Routes:** `/auth`

**States:**
- **Logged out** — Shows Login/Register toggle buttons. Default shows `LoginForm`.
- **Registering** — Shows `RegisterForm` (username, email, password, minLength validation).
- **Logged in** — Shows `Logout` confirmation with a single button.

**Internal components:**

| Component | Description |
|-----------|-------------|
| `LoginForm` | POSTs to `/api/auth/login`, navigates to `/` on success |
| `RegisterForm` | POSTs to `/api/auth/register`, navigates to `/` on success |
| `Logout` | DELETEs `/api/auth/logout`, navigates to `/` on success |

## Home — `src/pages/Home.jsx`

**Route:** `/` (index)

Renders the Google Map (via `<App>` component), a "Recent Posts" section with pin cards, an About section, and a Contact section. Fetches pins from `fetchPinPageData` loader.

**Sections:**
- Map with all recent pin markers
- Posts list (first 3 pins by default)
- About paragraph
- Contact links (GitHub, email)

## Pins — `src/pages/Pins.jsx`

**Exports:** `CreatePin`, `EditPin`, `Pin`, `Pins`, `RenderPins`, `getPins`, `getPin`, `getUserPins`, `fetchPinPageData`, `fetchUserPinPageData`, `DeletePost`, `isAuthorized`

**Routes:** `/pin` (index), `/pin/create`, `/pin/edit/:id`, `/pin/:id`

### `Pins` (list view)

Paginated list of all pins. Two `<Pagination>` components (top and bottom). Map shows all pins as markers. "Create Pin" button links to `/pin/create`.

**Loader:** Fetches `GET /api/pin/` with `perPage: 10, page: 1`.

### `Pin` (detail view)

Single pin detail with editable/deleteable controls (if authorized). Includes:
- Map centered on the pin's coordinates
- Title, author link, description text, image
- Delete/Edit buttons (shown if `isAuthorized`)
- Comment section with paginated comments ("View More" button)
- "New Comment" form (shown if user is logged in)
- Comment cooldown — prevents rapid re-submission via `commentCoolDown` boolean

### `CreatePin`

Form with:
- Title input (required)
- Interactive map — click to place marker, or "Use Current Location" button (browser geolocation)
- Image file upload (optional, `capture="environment"` for mobile)
- Comment textarea (optional)
- POSTs multipart form data to `/api/pin`

### `EditPin`

Pre-populated form (title, comment, map marker position). PUTs JSON to `/api/pin/:id`.

### Helper Functions

| Function | Purpose |
|----------|---------|
| `getPins({ userid, page, perPage })` | Fetches paginated pins. Sends `userid` header for user filtering. Returns `{ rows, count }`. |
| `getPin({ id })` | Fetches a single pin by ID. Returns `data.message`. |
| `getUserPins({ page, perPage })` | Fetches pins for the authenticated user (sends `Authorization: User` header). |
| `fetchPinPageData({ params })` | Loader wrapper — calls `getPins` with defaults `perPage: 3, page: 1`. |
| `fetchUserPinPageData({ params })` | Loader wrapper — calls `getPins` with `userid` from params. |
| `DeletePost(event, pin, navigator)` | Confirms then DELETEs `/api/pin/:id`, navigates to `/pin/` on success. |
| `isAuthorized(item, user)` | Returns true if `user.id === item.authorid` or `user.authLevel > 1`. Uses `==` (loose equality). |

## Profile — `src/pages/Profile.jsx`

**Exports:** `Dashboard`, `UserProfile`, `HandleLogout`, `HandleUserDeletion`, `getUser`, `isAuthorized`

**Routes:** `/dashboard`, `/profile/:id`

### `Dashboard`

Current user's dashboard. Shows:
- Paginated list of user's pins (3 per page)
- Logout button (calls `HandleLogout`, DELETEs `/api/auth/logout`)
- "Lock Account" button (stub — no handler)
- Delete Account button (calls `HandleUserDeletion`, DELETEs `/api/auth/delete`)

### `UserProfile`

Another user's profile page. Shows:
- Username from `GET /api/user/:id`
- Paginated list of user's pins
- Suspend/Unsuspend button (if viewer is authorized admin) — PUTs `/api/user/:id` with `action: "suspend"` header
- Delete button (if viewer is authorized) — DELETEs `/api/user/:id`

### Helper Functions

| Function | Purpose |
|----------|---------|
| `getUser(userid = null)` | Calls `/api/auth` if no `userid` (current user), else `/api/user/:id`. Returns `data`. The `/api/auth` call is made with `silent: true`. |
| `HandleLogout()` | DELETEs `/api/auth/logout`, returns boolean. |
| `HandleUserDeletion()` | Confirms then DELETEs `/api/auth/delete`. |
| `isAuthorized(primaryUser, otherUser)` | Returns true if `primaryUser.id === otherUser.id` or `otherUser.authLevel > 1`. |

## Comments — `src/pages/Comments.jsx`

**Exports:** `RenderComments`, `getComments`, `HandleCommentFormSubmission`, `CreateComment`, `Comment`

**Not a page** — imported and used by `Pin` and `Pins` pages. All functions are documented under [Components](Components.md) since they render UI.

## Admin — `src/pages/Admin.jsx`

**Exports:** `AdminDashboard`

**Route:** none wired

Stub component — renders an `<h1>Admin</h1>` heading. The `AdminLayout.jsx` is also empty. No admin functionality is implemented in the frontend.
