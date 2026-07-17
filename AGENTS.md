# AGENTS.md

## Project shape

- Two independent npm packages: root (`package.json`) is the Express/Sequelize backend, `app/` (`app/package.json`, `type: module`) is a Vite + React frontend. Install/lint/build each separately.
- Backend layout mirrors Laravel naming, not Node convention: `src/apis` = route handler logic, `src/routes/api.js` = router wiring/model sync, `src/models` = Sequelize model factories, `src/services` = shared helpers (auth checks, session config, admin bootstrap).
- `server.js` is the single backend entrypoint. It serves the built React app from `app/dist`, mounts API routes under `/api`, and serves uploaded files from `STORAGE_PATH` as static files.

## Module system quirk (don't "fix" this)

- Root package has no `"type": "module"`, so `.js` files are CommonJS by default. `src/routes/api.js` and `server.js` load backend modules with `require(...)`, but `src/apis/*.js` and `src/models/*.js` are written with `export default` / `import` (ESM syntax).
- This works only because of Node's stable `require(esm)` interop (Node ≥22, matches `node:22-alpine` in `Dockerfile.backend`). Keep this pattern — don't convert one side to the other without checking Node version compatibility.

## Commands

- Backend: `npm run start` (plain `node server.js`, loads `.env`), `npm run dev` (`node server.js .env.development.local --watch`, uses Node's built-in `--watch`, loads a different env file — see gotcha below). `npm run build` just delegates to `app`.
- Frontend (`cd app`): `npm run dev` (Vite dev server), `npm run build`, `npm run lint` (ESLint, frontend-only — there is no root-level lint/test config or CI).
- No test suite exists anywhere in the repo.

## Env files gotcha

- `server.js` loads **exactly one** env file (from `argv[2]`, via `dotenv`) — it does not merge with a base `.env`.
- `.env.development.local` (used by `npm run dev`) only defines `HOST`, `PORT`, `DEBUG`, `GOOGLE_MAPS_API_KEY`, `SESSION_SECRET`. It has no `DATABASE` or `STORAGE_PATH`, and neither has a fallback in code (`process.env.DATABASE` / `process.env.STORAGE_PATH` are used directly). Running `npm run dev` as-is will hit `path.join(process.cwd(), undefined)` unless you add those two keys to `.env.development.local` yourself.
- The frontend needs its own separate `app/.env` with the Google Maps key (Vite env, distinct from the root `.env`).

## Backend wiring details

- `src/routes/api.js` builds each Sequelize model then calls `.sync()` on it directly (no formal migrations directory despite the README mentioning `src/database`, which doesn't currently exist).
- On server start, `CheckAndMakeDefaultAdminAccount` (in `src/services/admin.js`) runs after a 1s `setTimeout` and creates `admin` / `password` if the `Users` table is empty — note it stores that password unhashed, unlike the bcrypt-hashed signup flow in `src/apis/users.js`.
- Sessions use `express-session` + `connect-session-sequelize`, storing sessions in the same SQLite DB (`sessionStore.sync()` in `server.js`).

## Docker / deployment

- `docker compose up --build` runs two services: `backend` (Node, not published to host ports) and `frontend` (nginx, ports 80/443, TLS certs from `nginx/certs/`). `nginx.conf` proxies `/api/` and `/public/storage/` to `backend:8000`; everything else falls back to the React SPA.
- Backend container mounts `./.sqlite3` and `./public/storage` as volumes — deleting those on the host resets data/uploads even without rebuilding.
