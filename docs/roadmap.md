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

- [ ] JWT auth migration (replace session auth; JWT verified on every protected route)
- [ X ] Request logging
- [ ] Rate limiting on API endpoints

**Done:** JWT is issued on login and verified on every protected route
(sessions removed); rate limiter active on auth + post/comment endpoints;
request logs capture method, route, status, and latency.

### Month 2 — Database

- [ ] Migrate from SQLite to PostgreSQL
- [ ] Database optimization: indexing, pagination, connection pooling, solve N+1
- [ ] API Versioning: prefix all API Routes with `/v1/`

**Done:** App runs fully on PostgreSQL (scalable, AWS-compatible); N+1
eliminated via eager-loaded queries; indexes, pagination, and pooling in place.

### Month 3 — Performance & Engagement

- [ ] Redis caching layer for frequently accessed queries
- [ ] Nested comments and replies

**Done:** Hot queries served from Redis instead of the database; users can
follow and reply within threaded comment chains.

### Month 4 — Front-End Revamp & First Security Pass

- [ ] Responsive / mobile-friendly layouts, dark mode, accessibility (ARIA, keyboard nav), loading skeletons
- [ ] Begin security hardening: Helmet headers, input sanitization, safe error handling, CSP

**Done:** Site is responsive with dark mode, accessibility, and skeletons;
first security pass started (headers set, inputs sanitized, errors no longer leak).

### Month 5 — Administration & Second Security Pass

- [ ] Admin / moderator dashboard (observability of the user base, post/comment queries, moderation tools)
- [ ] Second security pass: audit for vulnerabilities and unsecured APIs

**Done:** Admins can monitor and moderate via the dashboard; security re-audit complete.

### Month 6 — Final Security Hardening

- [ ] Research-driven pass on current standards and known vulnerabilities

**Done:** App meets current security best practices established during research.

## Future Features (Deferred)

- Real-time updates & WebSocket chat
- OAuth 2.0 (Google / GitHub / Facebook) + 2FA/TOTP + password reset
- Image recognition / moderation + OCR
- AWS / cloud deployment
- Map-pin "clumping" rework + list view
- OpenStreetMap API exploration
- Password changing
