# Routing Architecture

## Overview

Uses React Router 7's **data router** (`createBrowserRouter`) with nested route trees. Route definitions live in `src/routes/routes.jsx`; standalone loader functions are duplicated in `src/routes/loaders.jsx` (unused — `routes.jsx` defines its own loaders inline).

## Entrypoint

`src/main.jsx` mounts `<RouterProvider router={router} />` inside `StrictMode`.

## Route Tree

```
<RootLayout>                          — id: "root", loader: RootLoader (fetches /api/config)
  /
    <MainLayout>                      — loader: getUserLoader
      index                           — <Home>, loader: fetchPinPageData
  /auth
    <MainLayout>                      — loader: getUserLoader
      index                           — <Auth>
  /pin
    <MainLayout>                      — loader: getUserLoader
      index                           — <Pins perPage={10}>, loader: fetches first page
      /pin/create                     — middleware: [authMiddleware], <CreatePin>
      /pin/edit/:id                   — middleware: [authMiddleware], <EditPin>, loader: PinDataLoader
      /pin/:id                        — <Pin>, loader: PinCommentDataLoader
  /dashboard
    <MainLayout>                      — middleware: [authMiddleware], loader: getUserLoader
      index                           — <Dashboard>, loader: UserPinsLoader
  /profile/:id
    <MainLayout>                      — middleware: [authMiddleware], loader: getUserLoader
      index                           — <UserProfile>, loader: UserProfileLoader
```

## Layouts

| Layout | File | Purpose |
|--------|------|---------|
| `RootLayout` | `layouts/RootLayout.jsx` | Renders `<Outlet>` + `<ToastContainer>`. Provides root config (Google Maps API key) via outlet context. |
| `MainLayout` | `layouts/MainLayout.jsx` | Renders site header (nav with Home, Posts, About, Contact, user menu) + `<Outlet>`. Reads user from loader data. |
| `AdminLayout` | `layouts/AdminLayout.jsx` | Empty stub. |

## Loaders

All loaders are async functions that run before the route component renders. They return data accessible via `useLoaderData()`.

| Loader | Defined In | Returns |
|--------|-----------|---------|
| `RootLoader` | `routes.jsx` | `{ GOOGLE_MAPS_API_KEY, ... }` from `GET /api/config` |
| `getUserLoader` | `routes.jsx` | `{ user }` from `GET /api/auth` (or `GET /api/user/:id`) |
| `PinDataLoader` | `routes.jsx` | `{ pin, user }` — single pin + current user |
| `PinCommentDataLoader` | `routes.jsx` | `{ pin, user, comments }` — pin detail + paginated comments + user |
| `UserPinsLoader` | `routes.jsx` | `{ user, startingPins }` — current user + first 3 of their pins |
| `UserProfileLoader` | `routes.jsx` | `{ user, startingPins }` — profile user + first 3 of their pins |
| `fetchPinPageData` | `Pins.jsx` | `{ pins: { rows, count } }` — paginated pins for the homepage |

The standalone `loaders.jsx` file copies `getUserLoader`, `PinDataLoader`, `PinCommentDataLoader`, `UserPinsLoader`, and `UserProfileLoader` — but `routes.jsx` defines its own versions of all of them, making `loaders.jsx` dead code.

## Middleware

`src/middleware/authMiddleware.jsx`:

```
export async function authMiddleware()
```

Calls `getUser()`. If no user returned, throws `redirect("/auth")`. Applied to the `middleware` array of a route definition — React Router 7 runs it before the loader. Used on `/pin/create`, `/pin/edit/:id`, `/dashboard`, and `/profile/:id`.

## Error Handling

`RootErrorBoundary` in `routes.jsx`:

- Catches `isRouteErrorResponse` (HTTP errors like 404) and renders status + names of missing data keys.
- Catches `Error` instances and renders the error message with a "Go Back" button.
- Falls through to "Unknown Error" for anything else.

Applied to `/`, `/pin/:id`, `/pin/edit/:id`, `/profile/:id`.

## Key Files

| File | Purpose |
|------|---------|
| `src/main.jsx` | Entrypoint — mounts `<RouterProvider>` |
| `src/routes/routes.jsx` | All route definitions, loaders, error boundary |
| `src/routes/loaders.jsx` | Duplicate loaders (dead code — routes.jsx has its own) |
| `src/middleware/authMiddleware.jsx` | Auth guard — redirects to `/auth` if unauthenticated |
| `src/layouts/RootLayout.jsx` | Root layout with toast container |
| `src/layouts/MainLayout.jsx` | Main layout with header nav |
| `src/layouts/AdminLayout.jsx` | Empty stub |
