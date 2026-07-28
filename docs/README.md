# Documentation

This directory holds the project's documentation. Everything here is meant to
be read on GitHub or any Markdown renderer.

## How to explore

Start with the topic that matches what you're working on:

| If you're looking for… | Start here |
|---|---|
| Backend architecture, quirks, auth design | [`architecture/backend.md`](architecture/backend.md) |
| Frontend architecture, routing, components | [`architecture/frontend.md`](architecture/frontend.md) |
| All REST endpoints, request/response tables | [`api.md`](api.md) |
| Docker, nginx, deployment | [`deployment/docker.md`](deployment/docker.md) |
| What's planned vs. what's shipped | [`roadmap.md`](roadmap.md) |

For deeper dives, each architecture overview links to sub-docs:

- **Backend** — `architecture/backend/` — Authentication, Pins, Comments, Users
- **Frontend** — `architecture/frontend/` — Routing, Pages, Components, API Layer, Configuration

## Formatting and style

These docs follow a few conventions to stay consistent and skimmable.

### Tone

- Concise, matter-of-fact. No marketing, no conversational filler.
- Assume the reader is a developer who wants to understand or fix something.
- "Notable quirks" sections call out non-obvious behavior — read these before
  debugging.

### Tables

Endpoint tables use this layout:

```
| Method | Path | Auth | Body | Response |
```

- **Method** — HTTP verb
- **Path** — full route (assumes `/api` prefix)
- **Auth** — who can call it (`—` = public, `BasicAuth` = logged-in, `AdminAuth` = level 2, `session` = cookie-based, etc.)
- **Body** — request payload (JSON keys or multipart fields)
- **Response** — JSON shape on success

Tables for other purposes (props, env vars, files) use:

```
| Column | Value | Description |
```

### Code blocks

- JavaScript/JSX: language tag `js` or `jsx`
- HTTP responses shown as JSON without a language tag
- Inline code for paths, variable names, function names

### Comments

HTML comments (`<!-- ... -->`) mark unfinished features, known gaps, or
deferred work. If you see one, it's intentional — don't treat it as a
mistake.

### Linking

- Cross-references within `docs/` use **relative** paths (no repo root prefix).
- If a sub-doc exists for a topic, the parent doc links to it with a table.

### What to document

- Every public API endpoint (method, path, auth, body, response).
- Every route, layout, loader, and middleware (frontend).
- Every React component export and its props.
- Known issues, dead code, and design quirks — explicitly, in a "Notable
  quirks" or "Known issues" section.
- Environment variables that the code reads directly.

### What NOT to document

- Implementation details that are obvious from reading the code (e.g.,
  "`useState` returns a state variable and a setter").
- Internal-only helper functions that aren't exported or reused.
- Speculative features — if it's not shipped, it goes in `roadmap.md`.

## File layout

```
docs/
├── README.md                 ← this file
├── api.md                    ← REST endpoints reference
├── roadmap.md                ← shipped features + monthly plan + debt
├── architecture/
│   ├── backend.md            ← backend overview
│   ├── backend/              ← backend sub-docs
│   │   ├── Authentication.md
│   │   ├── Authorization.md  ← stub
│   │   ├── Comments.md
│   │   ├── Pins.md
│   │   └── Users.md
│   ├── frontend.md           ← frontend overview
│   └── frontend/             ← frontend sub-docs
│       ├── Routing.md
│       ├── Pages.md
│       ├── Components.md
│       ├── ApiLayer.md
│       └── Configuration.md
├── deployment/
│   └── docker.md
└── devops/                   ← empty
```
