# Coordinated Authentication and Authorization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deduplicate concurrent frontend current-user requests and consolidate backend authorization around explicit auth levels and live database-backed route middleware.

**Architecture:** Keep `authentication.js` responsible for establishing `req.user` from a session or JWT. Add model-backed `requireAuth(usersModel)` and `requireAdmin(usersModel)` middleware that refreshes identity from the database, then attach those guards explicitly to protected mutations while leaving ownership checks in handlers. Share only the in-flight `/api/v1/auth` promise in the frontend and remove redundant loader calls without introducing settled-result caching.

**Tech Stack:** Express 5, Sequelize 6, CommonJS/ESM interop already used by the backend, Vitest, React 19, React Router 7, Axios, Vite.

## Global Constraints

- Auth levels are `0` suspended, `1` standard, and `2` administrator.
- `requireAuth` allows standard and administrator users; `requireAdmin` allows administrators only.
- Middleware must load the current user from the database for every protected request.
- Missing identity and deleted users return `401`; suspended or insufficient users return `403`.
- Public read routes remain public.
- Resource ownership checks remain in route handlers.
- Frontend auth caching is in-flight-only and must clear in `finally` after settlement.
- Do not add JWT revocation, TTL caching, global API authentication, or unrelated refactoring.
- Use the existing shared `usersModel` instance when constructing authorization middleware.

---

## File Map

| File | Responsibility in this change |
|---|---|
| `backend/services/constants.js` | Export the frozen auth-level enum while preserving existing aliases. |
| `backend/middleware/authorization.js` | Implement model-backed `requireAuth` and `requireAdmin`. |
| `backend/apis/auth.js` | Guard account deletion and remove `BasicAuth` usage. |
| `backend/apis/users.js` | Guard moderation and profile deletion; use `req.user`. |
| `backend/apis/pins.js` | Guard pin mutations and use unified identity. |
| `backend/apis/comments.js` | Guard comment mutations and use unified identity. |
| `backend/routes/api.js` | Pass the shared user model into router factories. |
| `backend/tests/authorization.test.js` | Test middleware status/identity behavior. |
| `backend/tests/protected-routes.test.js` | Test route-level guard wiring and JWT-shaped users. |
| `frontend/src/pages/Profile.jsx` | Add in-flight auth request sharing. |
| `frontend/src/routes/loaders.jsx` | Remove redundant current-user loader calls if this maintained loader module is used. |
| `frontend/src/routes/routes.jsx` | Apply the same loader deduplication to the active route definitions. |
| `frontend/tests/auth-request.test.js` or the existing frontend test location | Test concurrent `getUser()` calls if a frontend test runner is configured. |
| `docs/superpowers/specs/2026-08-12-auth-authorization-coordination-design.md` | Approved design reference. |

## Task 1: Define Auth Levels and Middleware

**Files:**
- Modify: `backend/services/constants.js`
- Modify: `backend/middleware/authorization.js`
- Create: `backend/tests/authorization.test.js`

**Interfaces:**
- Produces `AUTH_LEVEL`, an `Object.freeze` object with `SUSPENDED`, `STANDARD`, and `ADMIN` numeric members.
- Produces `requireAuth(usersModel)` and `requireAdmin(usersModel)`, each returning Express middleware `(req, res, next) => Promise<void>`.
- Middleware replaces an accepted `req.user` with `{ userid, username, authLevel }` from the database.

- [ ] **Step 1: Write failing middleware tests**

Create an in-memory Sequelize `Users` model and invoke the middleware with mock request/response objects. Cover the exact status contract:

```js
test("requireAuth rejects a missing identity with 401", async () => {
  const response = responseDouble();
  await requireAuth(usersModel)({}, response.res, next);
  expect(response.status).toHaveBeenCalledWith(401);
  expect(response.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  expect(next).not.toHaveBeenCalled();
});

test("requireAuth rejects a suspended current user with 403", async () => {
  const user = await usersModel.create({ authLevel: AUTH_LEVEL.SUSPENDED });
  const response = responseDouble();
  await requireAuth(usersModel)(
    { user: { userid: user.id, authLevel: AUTH_LEVEL.ADMIN } },
    response.res,
    next,
  );
  expect(response.status).toHaveBeenCalledWith(403);
  expect(next).not.toHaveBeenCalled();
});

test("requireAdmin refreshes stale claims from the database", async () => {
  const user = await usersModel.create({ authLevel: AUTH_LEVEL.ADMIN });
  const req = { user: { userid: user.id, authLevel: AUTH_LEVEL.STANDARD } };
  await requireAdmin(usersModel)(req, response.res, next);
  expect(req.user.authLevel).toBe(AUTH_LEVEL.ADMIN);
  expect(next).toHaveBeenCalledOnce();
});
```

Use a complete `responseDouble()` helper with chainable `status()` and a `json()` spy, and reset the database between tests.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm --prefix backend exec vitest run tests/authorization.test.js`

Expected: FAIL because `AUTH_LEVEL` and the middleware behavior are not implemented.

- [ ] **Step 3: Implement the auth-level enum**

In `backend/services/constants.js`, add:

```js
export const AUTH_LEVEL = Object.freeze({
  SUSPENDED: 0,
  STANDARD: 1,
  ADMIN: 2,
});
```

Set existing exported numeric constants to reference the enum members so existing imports continue to work:

```js
export const SUSPENDED_AUTH_LEVEL = AUTH_LEVEL.SUSPENDED;
export const BASIC_AUTH_LEVEL = AUTH_LEVEL.STANDARD;
export const ADMIN_AUTH_LEVEL = AUTH_LEVEL.ADMIN;
export const DEFAULT_USER_AUTH_LEVEL = AUTH_LEVEL.STANDARD;
```

- [ ] **Step 4: Implement the middleware factories**

In `backend/middleware/authorization.js`, load the current user by `req.user.userid`. Return before `next()` for all failures:

```js
function unauthorized(res) {
  return res.status(401).json({ message: "Unauthorized" });
}

function forbidden(res) {
  return res.status(403).json({ message: "Forbidden" });
}

function currentIdentity(user) {
  return { userid: user.id, username: user.username, authLevel: user.authLevel };
}

export function requireAuth(usersModel) {
  return async function requireAuthMiddleware(req, res, next) {
    if (!req.user?.userid) return unauthorized(res);

    try {
      const user = await usersModel.findByPk(req.user.userid);
      if (!user) return unauthorized(res);
      if (user.authLevel < AUTH_LEVEL.STANDARD) return forbidden(res);
      req.user = currentIdentity(user);
      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
```

Implement `requireAdmin` with the same lookup/error handling but require `user.authLevel >= AUTH_LEVEL.ADMIN`. Do not read authorization from the stale claim after the lookup.

- [ ] **Step 5: Run the focused test to verify it passes**

Run: `npm --prefix backend exec vitest run tests/authorization.test.js`

Expected: PASS for missing, deleted, suspended, standard, administrator, and stale-claim cases.

- [ ] **Step 6: Commit the middleware unit**

```bash
git add backend/services/constants.js backend/middleware/authorization.js backend/tests/authorization.test.js
git commit -m "feat: add database-backed authorization middleware"
```

## Task 2: Wire Protected Backend Routes

**Files:**
- Modify: `backend/routes/api.js`
- Modify: `backend/apis/auth.js`
- Modify: `backend/apis/users.js`
- Modify: `backend/apis/pins.js`
- Modify: `backend/apis/comments.js`
- Create or modify: `backend/tests/protected-routes.test.js`

**Interfaces:**
- Router factories receive the existing `usersModel` where a guard is needed.
- Protected route handlers receive a refreshed `req.user` from Task 1.
- Public GET routes retain their current unauthenticated behavior.

- [ ] **Step 1: Add failing route-wiring tests**

Build a small Express test app with in-memory `Users`, `Pins`, and `Comments` models. Mount the same router factories used by `backend/routes/api.js`, authenticate test requests by setting a JWT-shaped `req.user` in test middleware, and assert the following:

```js
test("a standard user can create a comment through the guarded route", async () => {
  const response = await request.post("/comment").send({
    PinParent: pin.id,
    CommentParent: null,
    comment: "valid comment",
  });
  expect(response.status).toBe(201);
});

test("a suspended user cannot create a comment", async () => {
  await user.update({ authLevel: AUTH_LEVEL.SUSPENDED });
  const response = await request.post("/comment").send({
    PinParent: pin.id,
    CommentParent: null,
    comment: "blocked comment",
  });
  expect(response.status).toBe(403);
});

test("a standard user cannot suspend a profile", async () => {
  const response = await request
    .put(`/user/${otherUser.id}`)
    .set("action", "suspend")
    .send({});
  expect(response.status).toBe(403);
});
```

Also cover JWT-shaped identities on pin mutations, self-delete versus deleting another user, admin moderation, and ownership rejection. Ensure a public pin/comment read still succeeds without `req.user`.

- [ ] **Step 2: Run the focused route tests to verify they fail**

Run: `npm --prefix backend exec vitest run tests/protected-routes.test.js`

Expected: FAIL because the routes still use session-only checks or have no route-level guard.

- [ ] **Step 3: Wire the middleware into router factories**

Import the guards and create route-local middleware from the shared model:

```js
const requireAuthMiddleware = requireAuth(usersModel);
const requireAdminMiddleware = requireAdmin(usersModel);
```

Pass `usersModel` into `pinRouter` and `commentRouter` from `backend/routes/api.js`; update their signatures accordingly. Add middleware directly to these mutation routes:

```js
Router.post("/comment", requireAuthMiddleware, ...handlers);
Router.delete("/comment/:id", requireAuthMiddleware, handler);
Router.post("/pin", requireAuthMiddleware, ...handlers);
Router.put("/pin/:id/", requireAuthMiddleware, ...handlers);
Router.delete("/pin/:id", requireAuthMiddleware, handler);
```

Apply `requireAdminMiddleware` to `PUT /user/:id`, `requireAuthMiddleware` to `DELETE /user/:id`, and `requireAuthMiddleware` to `DELETE /auth/delete`. Keep `GET /auth` behind `authMiddleware` only.

- [ ] **Step 4: Replace handler identity and legacy guard usage**

In each migrated handler:

- Remove imports of `BasicAuth` and `AdminAuth`.
- Replace `req.session.userid` with `req.user.userid` where the route is guarded.
- Preserve ownership checks using the refreshed user identity and loaded target records.
- Ensure pin/comment creation writes the authenticated `req.user.userid`, not a caller-supplied identity.
- Retain session destruction for web account deletion.
- Keep admin-only target rules in handlers only where they are resource-specific; the profile suspension route itself is guarded by `requireAdmin`.

Do not change public read route status or response shapes in this task.

- [ ] **Step 5: Run backend route and regression tests**

Run: `npm --prefix backend exec vitest run tests/protected-routes.test.js tests/authorization.test.js tests/comments.test.js tests/user.test.js`

Expected: PASS, including public reads, authenticated session-shaped requests, JWT-shaped requests, and ownership cases.

- [ ] **Step 6: Commit the backend route migration**

```bash
git add backend/routes/api.js backend/apis/auth.js backend/apis/users.js backend/apis/pins.js backend/apis/comments.js backend/tests/protected-routes.test.js
git commit -m "refactor: route authorization through middleware"
```

## Task 3: Deduplicate Frontend Current-User Requests

**Files:**
- Modify: `frontend/src/pages/Profile.jsx`
- Modify: `frontend/src/routes/loaders.jsx`
- Modify: `frontend/src/routes/routes.jsx`
- Create or modify: existing frontend test location for auth/API tests

**Interfaces:**
- `getUser()` keeps its current public signature: `getUser(userid = null)`.
- `getUser()` returns the current `data` value for `/api/v1/auth` and continues returning profile data for `/api/v1/user/:id`.
- Only current-user calls share `inFlightAuthRequest`; profile lookups never share that promise.

- [ ] **Step 1: Add the concurrent-call test**

Mock `api` and invoke `getUser()` twice before resolving the mocked request:

```js
test("shares one in-flight current-user request", async () => {
  const pending = deferred();
  api.mockReturnValueOnce(pending.promise);

  const first = getUser();
  const second = getUser();

  expect(api).toHaveBeenCalledTimes(1);
  pending.resolve({ err: null, data: { id: 7, authLevel: 1 } });
  await expect(Promise.all([first, second])).resolves.toEqual([
    { id: 7, authLevel: 1 },
    { id: 7, authLevel: 1 },
  ]);
});

test("allows a new auth request after the previous one settles", async () => {
  api.mockResolvedValue({ err: null, data: null });
  await getUser();
  await getUser();
  expect(api).toHaveBeenCalledTimes(2);
});
```

Use the frontend test runner only if it already exists; otherwise keep this test as the intended behavior and validate with lint/build plus a focused mock/manual check.

- [ ] **Step 2: Run the focused frontend test to verify it fails**

Run the repository’s configured frontend test command for the new test, or document that no frontend test runner is configured.

Expected: FAIL before adding the shared promise, or unavailable if the frontend package has no test script.

- [ ] **Step 3: Implement the in-flight promise cache**

In `frontend/src/pages/Profile.jsx`, add module scope:

```js
let inFlightAuthRequest = null;
```

Change only the `userid === null` branch of `getUser()`:

```js
export function getUser(userid = null) {
  if (userid) {
    return api({ url: `/api/v1/user/${userid}` }).then(({ data }) => data);
  }

  if (!inFlightAuthRequest) {
    inFlightAuthRequest = api({
      url: "/api/v1/auth",
      silent: true,
    })
      .then(({ data }) => data)
      .finally(() => {
        inFlightAuthRequest = null;
      });
  }

  return inFlightAuthRequest;
}
```

Preserve existing `api()` error semantics and clear the shared promise on every settlement.

- [ ] **Step 4: Remove redundant loader auth calls**

Audit both `frontend/src/routes/routes.jsx` and `frontend/src/routes/loaders.jsx`, because both contain route-loader implementations. Remove only child calls that duplicate a parent current-user load. Do not remove `getUser(userid)` profile calls. Keep each loader’s returned object compatible with its component’s existing `useLoaderData()` expectations.

- [ ] **Step 5: Run frontend verification**

Run:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
```

Expected: both commands pass, with no new lint errors and a successful Vite production build.

- [ ] **Step 6: Commit the frontend optimization**

```bash
git add frontend/src/pages/Profile.jsx frontend/src/routes/loaders.jsx frontend/src/routes/routes.jsx frontend/tests
git commit -m "fix: deduplicate concurrent auth requests"
```

## Task 4: Documentation and Full Verification

**Files:**
- Review: `docs/superpowers/specs/2026-08-12-auth-authorization-coordination-design.md`
- Review: `docs/architecture/backend/Authorization.md`
- Modify: `docs/architecture/backend/Authorization.md` if the project documentation is expected to describe the implemented guards

- [ ] **Step 1: Update the authorization architecture page**

If the implementation is complete and the page is still empty, document the actual contract rather than future intent:

```markdown
# Authorization

Authentication establishes `req.user` from a session or Bearer JWT. Protected
mutations use `requireAuth(usersModel)` or `requireAdmin(usersModel)`, which
reload the current user before allowing the request to continue.

Auth levels are `0` suspended, `1` standard, and `2` admin. Missing or deleted
identities receive `401`; suspended or insufficient identities receive `403`.
Resource ownership checks remain in route handlers.
```

- [ ] **Step 2: Run the complete test suite**

Run: `npm test`

Expected: backend tests pass, frontend lint passes, and frontend build passes.

- [ ] **Step 3: Audit the final diff**

Run:

```bash
git diff --check
git status --short
```

Verify manually that:

- No API handler imports or calls `BasicAuth` or `AdminAuth`.
- Public GET routes were not accidentally guarded.
- Every protected mutation uses a route-level guard.
- `requireAuth` and `requireAdmin` perform live model lookups.
- The frontend in-flight promise is cleared in `finally`.
- No settled-result or TTL cache was introduced.

- [ ] **Step 4: Commit documentation and verified changes**

```bash
git add docs/architecture/backend/Authorization.md docs/superpowers/specs/2026-08-12-auth-authorization-coordination-design.md docs/superpowers/plans/2026-08-12-auth-authorization-coordination.md
git commit -m "docs: document auth authorization implementation"
```
