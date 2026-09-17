# Coordinated Authentication and Authorization Design

**Issues:** #58, #64, #67  
**Author:** OpenAI  
**Date:** 2026-08-12  
**Status:** Approved design; implementation pending  
**Version:** 1.0

## Overview

This change coordinates three authentication and authorization improvements:

- Deduplicate concurrent frontend `/api/v1/auth` requests (#58).
- Centralize the meaning of user authorization levels (#64).
- Replace ad-hoc route-handler authorization checks with reusable middleware (#67).

The work is intentionally scoped to the existing session/JWT authentication model,
the current Express routers, and the current React Router data-loading model. It
does not introduce persistent frontend auth caching, token revocation, or a new
permission system.

## Goals

1. Ensure concurrent calls to `getUser()` share one in-flight current-user request.
2. Make authorization levels explicit and consistently interpretable:
   - `0`: suspended
   - `1`: standard user
   - `2`: administrator
3. Enforce authorization through route-level middleware for protected mutations.
4. Apply suspension and role changes immediately by loading the current user from
   the database for every protected request.
5. Preserve resource-specific ownership checks in route handlers.
6. Keep public read routes and the current authentication endpoint behavior intact.

## Non-goals

- Persistent or TTL-based frontend auth-result caching.
- JWT revocation or refresh-token redesign.
- Global authentication on every API route.
- Replacing ownership checks with generic authorization middleware.
- Unrelated API response-format or security-hardening changes.

## Current Context

The backend supports both session and Bearer JWT authentication through
`backend/middleware/authentication.js`. Successful authentication sets
`req.user` with `userid`, `username`, and `authLevel`. The existing
`backend/services/admin.js` contains `BasicAuth` and `AdminAuth`, but route
handlers invoke them directly and the exported functions in
`backend/middleware/authorization.js` are stubs.

The frontend's `getUser()` in `frontend/src/pages/Profile.jsx` calls
`/api/v1/auth`. Parent loaders, child loaders, and the frontend auth middleware
can invoke it during the same navigation, producing duplicate requests.

## Authorization Architecture

### Auth-level definitions

Add a centralized frozen enum-like value in
`backend/services/constants.js`:

```js
export const AUTH_LEVEL = Object.freeze({
  SUSPENDED: 0,
  STANDARD: 1,
  ADMIN: 2,
});
```

Existing named constants (`SUSPENDED_AUTH_LEVEL`, `BASIC_AUTH_LEVEL`,
`ADMIN_AUTH_LEVEL`) remain available as compatibility aliases where appropriate.
New middleware and migrated route code should use the centralized definitions or
shared predicates rather than repeating unexplained numeric literals.

### Authorization middleware

Implement middleware factories in
`backend/middleware/authorization.js`:

```js
requireAuth(usersModel)
requireAdmin(usersModel)
```

Each middleware must:

1. Require an existing `req.user` populated by authentication middleware.
2. Load `usersModel.findByPk(req.user.userid)`.
3. Return JSON `401` if credentials are absent or the user no longer exists.
4. Return JSON `403` if the user is suspended or lacks the required level.
5. Replace `req.user` with the current database-backed identity.
6. Call `next()` only after the required authorization succeeds.

`requireAuth` allows standard and administrator accounts. `requireAdmin` allows
administrator accounts only. The current user lookup means suspension or role
demotion takes effect immediately for both session and JWT callers.

`GET /api/v1/auth` remains authentication-only. A suspended user may still be
identified there, while protected routes reject that user with `403 Forbidden`.

## Backend Route Wiring

The router constructors should receive the shared `usersModel` where required to
create authorization middleware instances.

| Module | Protected routes | Authorization | Handler responsibilities retained |
|---|---|---|---|
| `apis/auth.js` | `DELETE /auth/delete` | `requireAuth` | Destroy the current session and delete the current account |
| `apis/users.js` | `PUT /user/:id` | `requireAdmin` | Validate moderation action and target; toggle suspension |
| `apis/users.js` | `DELETE /user/:id` | `requireAuth` | Permit self-delete or admin deletion of another user |
| `apis/pins.js` | `POST /pin`, `PUT /pin/:id`, `DELETE /pin/:id` | `requireAuth` | Validate target ownership and pin-specific rules |
| `apis/comments.js` | `POST /comment`, `DELETE /comment/:id` | `requireAuth` | Validate parent relationships and comment ownership |

Public read routes remain unguarded. Migrated handlers use `req.user.userid`
instead of assuming a session-only identity, allowing the same route guards to
support both web sessions and Bearer JWT requests. Resource ownership checks are
not moved into middleware because they depend on route parameters and loaded
records.

After migration, API handlers should no longer import or call `BasicAuth` or
`AdminAuth`. The legacy helpers can be removed or retained only if another
non-route consumer demonstrably requires them; no duplicate authorization path
should remain.

## Frontend Request Deduplication

`getUser()` will maintain a module-level `inFlightAuthRequest` promise for the
current-user endpoint only:

```js
if (inFlightAuthRequest) return inFlightAuthRequest;

inFlightAuthRequest = api({
  url: "/api/v1/auth",
  silent: true,
}).then(({ data }) => data).finally(() => {
  inFlightAuthRequest = null;
});

return inFlightAuthRequest;
```

The implementation must preserve existing logged-out behavior and clear the
promise after success, `401`, network failure, or any other settled result. It
must not retain a settled result or introduce a TTL. Calls to
`getUser(userid)` continue to use `/api/v1/user/:id` and are not part of this
cache.

Redundant loader calls should also be removed where the parent loader already
provides the current user. In particular, `PinCommentDataLoader` should not make
an unnecessary independent current-user call after the coordinated route data
already supplies it. The change must not conflate current-user authentication
with profile lookups.

## Error Semantics

| Condition | Status | Meaning |
|---|---:|---|
| No `req.user` | 401 | Authentication middleware did not establish identity |
| User record missing | 401 | Credential identity no longer maps to an account |
| Suspended account | 403 | Identity exists but is not allowed to use protected routes |
| Standard user on admin route | 403 | Identity lacks administrator access |
| Authorized request | — | Middleware calls `next()` with refreshed `req.user` |

Responses use the existing JSON convention, including a `message` field. The
implementation should avoid exposing database errors in authorization responses;
unexpected lookup failures should be logged and returned as a generic server
error according to the project's existing middleware error-handling convention.

## Testing Strategy

### Backend

Add focused middleware and route integration tests covering:

- Missing `req.user`.
- Missing database user.
- Suspended user rejection.
- Standard user access to authenticated mutations.
- Standard user rejection from admin routes.
- Administrator access to admin routes.
- Database-backed role changes taking effect despite stale session/JWT claims.
- JWT-shaped `req.user` values on protected routes.
- Ownership checks continuing to reject unauthorized targets.

Existing backend Vitest tests should remain passing. Tests should use isolated
in-memory Sequelize databases and avoid requiring a running production database.

### Frontend

Add a focused test for concurrent `getUser()` calls if the frontend test setup is
available. The test should assert that simultaneous calls issue one auth request,
resolve consistently, and allow a later call to issue a new request after the
shared promise settles. At minimum, run the frontend lint and production build if
no frontend test runner is currently configured.

## Rollout and Verification

Implement in this order:

1. Add centralized auth-level definitions and middleware.
2. Wire middleware into backend routers.
3. Replace session-only identity reads and remove legacy guard usage.
4. Add and run backend authorization tests.
5. Add frontend in-flight request sharing and remove redundant loader calls.
6. Add or adapt frontend tests.
7. Run the complete verification suite:

```text
npm test
npm --prefix frontend run lint
npm --prefix frontend run build
```

Review the final diff for accidental protection of public reads, inconsistent
`401`/`403` behavior, remaining `BasicAuth`/`AdminAuth` route imports, and any
frontend cache that survives promise settlement.

## Risks and Mitigations

- **Stale authorization claims:** eliminated by the per-request database lookup.
- **JWT/session divergence:** reduced by normalizing both through refreshed
  `req.user`.
- **Behavior changes on previously weakly protected mutations:** covered by
  explicit route integration tests and the documented route table.
- **Duplicate frontend requests remaining in alternate route definitions:** audit
  both `frontend/src/routes/routes.jsx` and `frontend/src/routes/loaders.jsx`,
  which currently contain overlapping loader implementations.
- **Middleware/model wiring errors:** construct guards from the same shared
  `usersModel` instance used by each API router and test them with isolated models.

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-12 | Initial approved design for issues #58, #64, and #67 |
