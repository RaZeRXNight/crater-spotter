# AGENTS.md

## Project shape

- Two independent npm packages: `backend/` (Express/Sequelize, CJS) and `frontend/` (Vite + React, ESM). Install/lint/build each separately.
- Backend layout mirrors Laravel naming, not Node convention: `backend/apis/` = route handler logic, `backend/routes/api.js` = router wiring + model sync, `backend/models/` = Sequelize model factories, `backend/services/` = shared helpers (auth checks, session config, admin bootstrap), `backend/middleware/logging.js` = request logger.
- `backend/server.js` is the single backend entrypoint. It serves the built React app from `frontend/dist`, mounts API routes under `/api`, and serves uploaded files from `STORAGE_PATH` as static files.

## Module system quirk (don't "fix" this)

- `backend/package.json` has no `"type": "module"`, so `.js` files are CommonJS by default. `backend/routes/api.js` and `backend/server.js` load modules with `require(...)`, but `backend/apis/*.js`, `backend/models/*.js`, `backend/services/*.js`, and `backend/middleware/*.js` are written with `export default` / `import` (ESM syntax).
- This works only because of Node's stable `require(esm)` interop (Node ≥22, matches `node:22-alpine` in `backend/Dockerfile`). Keep this pattern — don't convert one side to the other without checking Node version compatibility.

## Commands

- **Backend** (from repo root or `backend/`): `npm run start` (plain `node server.js`, loads `backend/.env`). `npm run dev` (`node server.js backend/.env.development.local --watch`, uses Node's built-in `--watch`, loads a different env file — see gotcha below). `npm run build` delegates to `npm run --prefix ../frontend build`.
- **Frontend** (`cd frontend`): `npm run dev` (Vite dev server — no proxy configured, hits the real backend), `npm run build`, `npm run lint` (ESLint).
- No test suite, no typecheck, no CI, no root-level lint config.

## Env files gotcha

- `backend/server.js` loads **exactly one** env file (from `argv[2]`, via `dotenv`) — it does not merge with a base `.env`.
- `backend/.env.development.local` (used by `npm run dev`) only defines `HOST`, `PORT`, `DEBUG`, `GOOGLE_MAPS_API_KEY`, `SESSION_SECRET`. It does NOT define `DATABASE` or `STORAGE_PATH`, but `server.js` uses `process.env.DATABASE` / `process.env.STORAGE_PATH` directly. Running `npm run dev` as-is will error unless you add those two keys to `backend/.env.development.local`.
- The frontend needs its own `frontend/.env` with Vite env vars (e.g., `VITE_GOOGLE_MAPS_API_KEY`). This is separate from the backend `.env`.

## Backend wiring details

- `backend/routes/api.js` builds each Sequelize model then calls `.sync()` on it directly — no formal migrations directory.
- On server start, `CheckAndMakeDefaultAdminAccount` (in `backend/services/admin.js`) runs after a 1s `setTimeout` and creates `admin` / `password` if the `Users` table is empty — stores that password **unhashed** (plaintext), unlike the bcrypt-hashed signup flow in `backend/apis/auth.js`.
- Sessions use `express-session` + `connect-session-sequelize`, stored in the same SQLite DB (`sessionStore.sync()` in `backend/server.js`).

## Docker / deployment

- `docker compose up --build` from repo root runs two services: `backend` (Node, not published to host ports) and `frontend` (nginx, ports 80/443). `nginx/nginx.conf` proxies `/api/` and `/public/storage/` to `backend:8000`; everything else serves the React SPA. HTTP on port 80 redirects to HTTPS on 443 (TLS certs from `nginx/certs/`).
- Backend container mounts `./.sqlite3` at `/.sqlite3` (note: absolute path, not relative to `backend/`) and `./public/storage` at `/backend/public/storage` — deleting those on the host resets data/uploads even without rebuilding.

## Frontend notes

- React 19 + React Router 7 + Tailwind CSS v4 (no `tailwind.config.js` — v4 uses CSS-driven config via `@import "tailwindcss"` in `frontend/src/css/index.css`).
- Google Maps via `@vis.gl/react-google-maps`.
- Vite dev server has no proxy config (commented out in `frontend/vite.config.js`). API calls go directly to the backend during development.
