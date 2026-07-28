# Front-End Architecture

## High-Level Overview

React 19 + React Router 7 (data-aware routing) + Tailwind CSS v4. Built with Vite 7. Google Maps via `@vis.gl/react-google-maps`. HTTP client via `axios`. Notifications via `react-toastify`. The production build in `frontend/dist/` is served as a static SPA by the backend's Express server.

All API calls go to `/api/*` on the same origin — no proxy in dev (Vite proxy config is commented out).

## Resource Groups

| Resource | File |
|----------|------|
| Routing | [Routing.md](frontend/Routing.md) |
| Pages | [Pages.md](frontend/Pages.md) |
| Components | [Components.md](frontend/Components.md) |
| API Layer | [ApiLayer.md](frontend/ApiLayer.md) |
| Configuration | [Configuration.md](frontend/Configuration.md) |

## Notable Quirks

- **No proxy in dev** — `vite.config.js` has the proxy block commented out. Dev mode calls the real backend directly.
- **`authMiddleware` is a loader-level guard** — React Router middleware runs before the page component renders. If unauthenticated, it throws `redirect("/auth")`.
- **`getUser()` is called redundantly** — Every route loader calls `getUser()` via `getUserLoader`, even when the user data is already available from a parent loader.
- **`AdminLayout.jsx` is empty** — Stub with no content. The `Admin` page component is also a stub.
- **`AbsoluteOverlay.jsx` renders an empty div** — Dead component, unused.
- **`Table.jsx` is a stub** — Accepts parameters but renders an empty `<thead>` and a `<Pagination>` in `<tfoot>`. Not wired to any page.
- **Pagination headers** — The frontend sends `perPage` and `page` as HTTP headers (not query params), matching the backend's non-standard convention.
- **`authorid` vs `id`** — The backend returns the author's user ID as `authorid`, but the frontend's `isAuthorized` checks compare `authorid` against `user.id` (string vs number — uses `==` not `===`).
- **Cooldown on comment submission** — `HandleCommentForm` implements a `commentCoolDown` boolean guard (no actual timer-based cooldown, just a toggle that disables re-submission until toggled back).
