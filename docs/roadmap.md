# 6-Month Roadmap

> Single-developer project. ~4–6 hrs/week, with flexibility to go over.
> Primary goals: grow backend skills and make the app deployable.
> Android/mobile support is a secondary concern.

## Shipped Today (Implemented)

- Navigate Google Maps and drop a pin alongside a Post
- Upload an image alongside a post
- Create an account, log in and out
- View user profiles and their posts
- View your own dashboard
- Comment on posts and view comments
- Administrate your own posts and comments (delete them)
- Docker image for deployment (nginx container enforces HTTPS)

## Monthly Milestones

### Month 1 — Auth & Observability Foundations

- [ X ] JWT for mobile auth (coexists alongside session auth; JWT verified on protected routes via unified middleware)
- [ X ] Request logging

**Done:** JWT backend implementation complete — access/refresh token signing, verification, mobile login/register/logout endpoints, and unified middleware. What remains is the mobile app client (Flutter). Request logs capture method, route, status, and latency.

### Month 2 — Database

- [ ] Migrate from SQLite to PostgreSQL
- [ ] Database optimization: indexing, pagination, connection pooling, solve N+1
- [ X ] API Versioning: prefix all API Routes with `/v1/`

**Done:** App runs fully on PostgreSQL (scalable, AWS-compatible); N+1
eliminated via eager-loaded queries; indexes, pagination, and pooling in place.

### Month 3 — Performance & Engagement

- [ ] Redis caching layer for frequently accessed queries
- [ ] Nested comments and replies
- [ ] API response consistency: add `message` field to all success responses so the frontend toast wrapper works universally; fix endpoints that silently swallow errors (no HTTP response)
- [ ] Implement Vitest for frontend and backend unit/integration testing

**Done:** Hot queries served from Redis instead of the database; users can
follow and reply within threaded comment chains.

### Month 4 — Front-End Revamp & First Security Pass

- [ ] Responsive / mobile-friendly layouts, dark mode, accessibility (ARIA, keyboard nav), loading skeletons
- [ ] Begin security hardening: Helmet headers, input sanitization, safe error handling, CSP
  - [ ] Consistent API error format: convert remaining `.send()` plain-text responses to `.json()` (`users.js`, `pins.js`)
- [ ] Implement Playwright for frontend end-to-end testing

**Done:** Site is responsive with dark mode, accessibility, and skeletons;
security headers set (CSP, X-Frame-Options, X-Content-Type-Options, X-Powered-By removed);
session cookies hardened (SameSite, Secure behind proxy, saveUninitialized off);
cache-control tightened; inputs sanitized; errors no longer leak.

### Month 5 — Administration & Second Security Pass

- [ ] Admin / moderator dashboard (observability of the user base, post/comment queries, moderation tools)
- [ ] Define authLevel enums: `0` suspended, `1` standard, `2` admin
- [ ] Authorization middleware: consolidate ad-hoc auth guard rails (`BasicAuth`/`AdminAuth` in each route handler) into `middleware/authorization.js` (`requireAuth`, `requireAdmin`)
- [ ] Second security pass: audit for vulnerabilities and unsecured APIs

**Done:** Admins can monitor and moderate via the dashboard; ZAP scan passed with no actionable Medium+ alerts; security re-audit complete.

### Month 6 — Final Security Hardening

- [ ] Research-driven pass on current standards and known vulnerabilities
- [ ] Rate limiting on API endpoints

**Done:** App meets current security best practices established during research.

## Technical Debt

- [ ] **Deduplicate `/api/auth` calls** — Multiple React Router loaders and middleware independently call `getUser()` → `/api/auth` on the same page load. Public post pages hit it twice (parent `getUserLoader` + child `PinCommentDataLoader`); protected routes hit it twice (parent loader + `authMiddleware`). Fix: (a) remove redundant `getUser()` calls in child loaders where the component already reads user from `useOutletContext()`, and/or (b) add a concurrent-request cache in `getUser()` so in-flight `/api/auth` calls are shared.

## Future Features (Deferred)

- JWT token revocation (denylist or token versioning) — required for proper mobile logout
- Real-time updates & WebSocket chat
- OAuth 2.0 (Google / GitHub / Facebook) + 2FA/TOTP + password reset
- Image recognition / moderation + OCR
- AWS / cloud deployment
- Map-pin "clumping" rework + list view
- OpenStreetMap API exploration
- Password changing
- Pin search & filtering (autocomplete, date/category/severity filters, radius slider)
- User search / filtering
- Edit profile / account settings
- Push notifications (distinct from in-app WebSocket chat)
- CSRF protection
