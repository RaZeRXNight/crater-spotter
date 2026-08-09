# Frontend Roadmap

> Frontend work split from the six-month project roadmap.
> Primary focus: reliable Pin pages, accessible interactions, and predictable API state.

## Shipped Today (Implemented)

- [ X ] View pins and open a Pin detail page
- [ X ] View comments on a Pin
- [ X ] Create a comment when authenticated
- [ X ] Delete comments when authorized

## Current Work

### Pin Comments

- [ ] Derive the "View More" button visibility from the loaded comment count and the API's total `count`, rather than initializing it as visible.
- [ ] Prevent an extra page request when the comment count is an exact multiple of the page size.
- [ ] Handle failed initial and subsequent comment requests without crashing the Pin page or leaving the button disabled.
- [ ] Reset, close, and refresh the comment form only after a successful comment submission.
- [ ] Use one shared comment pagination state update for initial loads, "View More", and post-submission refreshes.
- [ ] Add coverage for empty, partial, exact-boundary, and failed comment-page responses.

## Technical Debt

- [ ] Replace direct DOM mutation of the "View More" button's `disabled` property with React loading state.
- [ ] Normalize failed loader responses so a failed comment request cannot reach `data.comments.rows` through a `null` value; show an explicit empty/error state instead.
- [ ] Load pin, comment, and user data in parallel in the Pin loader instead of waiting on each request sequentially.
- [ ] Add a stable secondary sort key to comment pagination if offset pagination remains in use.

## Future Features (Deferred)

- Nested comment replies and threaded comment navigation
- Real-time comment updates
