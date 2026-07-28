# Components

## Overview

Shared UI components in `src/components/`. Also notable: two rendering functions in page files (`RenderPins`, `RenderComments`) that act as components.

## Maps — `src/components/Maps.jsx`

**Export:** `App` (default)

Google Maps wrapper using `@vis.gl/react-google-maps`. Reads the API key from `useRouteLoaderData("root")` — the root loader fetches it from `GET /api/config`.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `OnClick` | Function | no-op | Click handler on the map. Receives Google Maps event with `event.detail.latLng`. |
| `style` | Object | `{ width: "100%", height: "300px" }` | Inline styles for the map container. |
| `markerPositions` | Array | — | Array of `{ id, title, lat, lng }` objects. Renders clickable `AdvancedMarker` elements that navigate to `/pin/:id`. |
| `currentMarkerPosition` | Object | — | Single `{ lat, lng }` for a marker at the current selection (create/edit forms). |
| `startingCenter` | Object | `{ lat: 25.033328, lng: -77.421165 }` | Default map center (Nassau, Bahamas). |
| `defaultZoom` | Number | `11` | Default zoom level. |

**Behavior:**
- If `markerPositions` is not provided, falls back to checking `useLoaderData().pins.rows`.
- `disableDefaultUI` is set — no street view, zoom controls, etc.
- `gestureHandling="greedy"` — single-finger pan on mobile.
- `mapId={"DEMO_MAP_ID"}` — Google Maps map ID (demo/unsupported).

## Card — `src/components/Card.jsx`

**Export:** `Card` (default)

Renders a pin summary card in list views (Home, Pins, Dashboard, UserProfile).

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | Number | — | Pin ID. Used in the link to `/pin/:id` and DELETE target. |
| `title` | String | — | Pin title. |
| `comment` | String | — | Pin description/comment. |
| `admin` | Boolean | `false` | If true, shows "edit" and "Delete" controls. |

**Behavior:**
- Title/comment link to `/pin/:id`.
- Delete button confirms with `window.confirm`, then DELETEs `/api/pin/:id` and navigates to `/pin/`.

## Pagination — `src/components/paginations.jsx`

**Export:** `Pagination`

Prev/Next pagination controls for pin and comment lists.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | Number | — | Current page (external state). |
| `setPage` | Function | — | State setter for page. |
| `HandlePageChange` | Function | — | Async function `(newPage, perPage) => count`. Returns the number of items fetched. Controls button disabled state. |
| `perPage` | Number | `3` | Items per page. |

**Behavior:**
- "Back" button: decrements page, calls `HandlePageChange`. Disabled at page 1.
- "Forward" button: increments page, calls `HandlePageChange`. Disabled if returned `count < perPage`.
- Current page number displayed between buttons.

## Table — `src/components/Table.jsx`

**Export:** `Table` (default)

Stub component. Accepts `tableHead`, `tbody`, `data`, `props`, `pagination` parameters but renders an empty `<thead>`, the provided `tbody`, and a `<Pagination>` (no props) in `<tfoot>`. Not used by any page.

## AbsoluteOverlay — `src/components/AbsoluteOverlay.jsx`

**Export:** `AbsoluteOverlay` (default)

Renders an empty `<div>`. Dead code — unused by any page.

## RenderPins — `src/pages/Pins.jsx`

Not a component file, but a rendering function used across pages.

**Signature:** `RenderPins({ rows, user })`

Maps an array of pin objects to `<Card>` elements. Passes `admin` flag based on `isAuthorized(user, row)`.

## RenderComments — `src/pages/Comments.jsx`

**Signature:** `RenderComments({ rows, user })`

Maps an array of comment objects to `<Comment>` components. Passes `admin` flag based on `isAuthorized(user, row)` (imports `isAuthorized` from `Pins.jsx`, which checks `authorid` against `user.id`).

## Comment — `src/pages/Comments.jsx`

**Signature:** `Comment({ id, authorid, authorName, comment, admin })`

Renders a single comment with author link and delete button (if admin). Delete hides the comment card via `document.getElementById().hidden`.

## CreateComment — `src/pages/Comments.jsx`

**Signature:** `CreateComment({ commentForm, setCommentFormState, HandleFormSubmission })`

Form for submitting a comment. Single textarea + Submit button. Controlled via `commentForm` state object with fields: `{ PinParent, CommentParent, replyLevel, comment }`.
