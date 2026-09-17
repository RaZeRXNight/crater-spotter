# AGENTS.md

## Project shape

- Two independent npm packages: `backend/` (Express 5 / Sequelize / CJS) and `frontend/` (Vite + React 19 / ESM). Install/lint/build each separately. No root package.json or root-level scripts.
- Backend layout mirrors Laravel naming, not Node convention: `backend/apis/` = route handler logic, `backend/routes/api.js` = router wiring + model sync, `backend/models/` = Sequelize model factories, `backend/services/` = shared helpers and values (auth checks, JWT, session config, pagination validation, `constants.js`, admin bootstrap), `backend/middleware/` = Express middleware, `backend/schema/` = express-validator schemas.
- `backend/server.js` is the single backend entrypoint. It serves the built React app from `frontend/dist`, mounts API routes under `/api`, and serves uploaded files from `STORAGE_PATH` as static files.

## Module system quirk (don't "fix" this)

- `backend/package.json` has no `"type": "module"`, so `.js` files are CommonJS by default. `backend/routes/api.js` and `backend/server.js` load modules with `require(...)`, but `backend/apis/*.js`, `backend/models/*.js`, `backend/services/*.js`, and `backend/middleware/*.js` are written with `export default` / `import` (ESM syntax).
- This works only because of Node's stable `require(esm)` interop (Node ≥22, matches `node:22-alpine` in `docker/backend/crater-spotter`). Keep this pattern — don't convert one side to the other without checking Node version compatibility.

## Commands

- **Backend** (from repo root or `backend/`): `npm run start` (plain `node server.js`, loads `backend/.env`). `npm run dev` (`node server.js backend/.env.development.local --watch`, uses Node's built-in `--watch`, loads a different env file — see gotcha below). `npm run build` delegates to `npm run --prefix ../frontend build`.
- **Frontend** (`cd frontend`): `npm run dev` (Vite dev server — no proxy configured, hits the real backend), `npm run build`, `npm run lint` (ESLint), `npm run preview` (preview production build).
- One assertion-based backend validator test is available: `node backend/tests/validation.test.js`. No typecheck, CI, or root-level lint config.

## Env files gotcha

- `backend/server.js` loads **exactly one** env file (from `argv[2]`, via `dotenv`) — it does not merge with a base `.env`.
- `backend/.env.development.local` (used by `npm run dev`) only defines `HOST`, `PORT`, `DEBUG`, `GOOGLE_MAPS_API_KEY`, `SESSION_SECRET`. It does NOT define `DATABASE`, `STORAGE_PATH`, or `DB_DIALECT`, but `server.js` uses all three directly. Running `npm run dev` as-is will error unless you add those keys to `backend/.env.development.local`.
- The frontend needs its own `frontend/.env` with Vite env vars (e.g., `VITE_GOOGLE_MAPS_API_KEY`). This is separate from the backend `.env`.

## Backend wiring details

- `backend/routes/api.js` builds each Sequelize model then calls `.sync()` on it directly — no formal migrations directory.
- Models are defined in `backend/models/*.js`, each importing `DataTypes` from Sequelize and returning a defined model. The `Pins` model takes a `userModel` parameter for foreign key references; `Comments` references both `Users` and `Pins` from the shared sequelize instance.
- On server start, `CheckAndMakeDefaultAdminAccount` (in `backend/services/admin.js`) runs after a 1s `setTimeout` and creates `admin` / `password` if the `Users` table is empty — stores that password **unhashed** (plaintext), unlike the bcrypt-hashed signup flow in `backend/apis/auth.js`.
- Sessions use `express-session` + `connect-session-sequelize`, stored in the same SQLite DB (`sessionStore.sync()` in `backend/server.js`).
- Auth middleware (`backend/middleware/authentication.js`) supports dual auth: `Authorization: Bearer <JWT>` header (for mobile) with fallback to `req.session` (for web). On success it sets `req.user` with `{ userid, username, authLevel }`.
- `backend/middleware/authorization.js` exports `requireAuth` and `requireAdmin` but both are **empty stubs** — actual auth-level checks are done inline in API handlers via `BasicAuth()` / `AdminAuth()` from `backend/services/admin.js`.

## Dead / dormant code

- `backend/apis/api.js` is dead code — a stub router with placeholder routes that's never imported anywhere.
- `backend/apis/mobileAuth.js` provides JWT-based login/register/refresh endpoints (`/auth/mobile/*`) but the import is **commented out** in `backend/routes/api.js`. The JWT service (`backend/services/jwt.js`) and `backend/middleware/authentication.js` are wired and functional if mobile auth is activated.

## Docker / deployment

- `docker compose up --build` from repo root runs the HTTP development stack: `backend` (serves the built React SPA, API, and uploads on host port 8000) and PostgreSQL. `docker compose -f docker-compose.prod.yml up --build` serves the same application on host port 80; TLS is handled by an external reverse proxy.
- Backend container mounts `./public/storage` at `/backend/public/storage`; PostgreSQL data is stored in the `postgres_data` Docker volume. Removing those persistent stores removes uploads or database data.
- Root `.gitignore` excludes: `.env*` (except `.env.example`), `node_modules/`, `.sqlite3*` (legacy SQLite artifacts), `public/storage/*`, `docker/nginx/certs/*`, `docker/nginx/acme/*`, logs.

## Frontend notes

- React 19 + React Router 7 + Tailwind CSS v4 (no `tailwind.config.js` — v4 uses CSS-driven config via `@import "tailwindcss"` in `frontend/src/css/index.css`).
- Google Maps via `@vis.gl/react-google-maps`.
- Vite dev server has no proxy config (commented out in `frontend/vite.config.js`). API calls go directly to the backend during development.
