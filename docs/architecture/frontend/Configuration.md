# Configuration

## Build Tooling

| Tool | Version | Notes |
|------|---------|-------|
| Vite | ^7.3.1 | Build tool and dev server |
| @vitejs/plugin-react | ^5.1.1 | React Fast Refresh |
| @tailwindcss/vite | ^4.2.2 | Tailwind CSS v4 Vite plugin |
| ESLint | ^10.1.0 | Linting, config in `eslint.config.js` |
| React | ^19.2.0 | UI library |
| React Router | ^7.13.1 | Data-aware routing |
| Tailwind CSS | ^4.2.1 | Utility-first CSS (v4 — CSS-driven config, no `tailwind.config.js`) |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `axios` | 1.18.0 | HTTP client |
| `@vis.gl/react-google-maps` | ^1.7.1 | Google Maps React components |
| `react-toastify` | ^11.0.5 | Toast notifications |
| `tailwindcss` | ^4.2.1 | CSS framework |

## Vite Config (`vite.config.js`)

Minimal config:

```js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // alias: { "@": path.resolve(__dirname, "./src") },
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: `http://${process.env.HOST || "localhost"}:${process.env.PORT || "8001"}`,
  //       changeOrigin: true,
  //     },
  //   },
  // },
});
```

- **Proxy** is commented out. Dev mode calls the real backend directly.
- **Path alias** (`@/`) is commented out. All imports use relative paths.
- No `envDir`, no `define`, no `build.outDir` customization (defaults to `dist/`).

## Environment Variables

The frontend reads env vars at runtime from `import.meta.env` (Vite convention). Only one is used:

| Variable | Required | Purpose | Used In |
|----------|----------|---------|---------|
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps JavaScript API key | Maps component (via `/api/config` — actually fetched from backend, not from `import.meta.env`) |

**Note:** The frontend does **not** read `VITE_GOOGLE_MAPS_API_KEY` from its own `.env` at build time. The Maps component fetches it from `GET /api/config` at runtime via the root loader. The `VITE_GOOGLE_MAPS_API_KEY` env var is still needed by the backend to serve it from `/api/config`.

## Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint on all files |

## CSS Architecture

CSS is in `src/css/`. Tailwind CSS v4 is imported via `@import "tailwindcss"` in `src/css/index.css`.

| File | Purpose |
|------|---------|
| `index.css` | Root styles, CSS custom properties (`--primary-color: #ffdd70`, `--background-color: #121212`), base element styles (body, a, h1, h2, button). Imports `card.css`. |
| `card.css` | Card component styles |
| `forms.css` | Form element styles |
| `table.css` | Table styles |
| `articles.css` | Article/page content styles |
| `App.css` | App-level styles |
| `Home.css` | Home page styles (imported by `MainLayout` via `../css/Home.css`) |

## Deployment

The production build (`frontend/dist/`) is served as a static SPA by the backend's Express server (`server.js` serves it from the working directory). In Docker/nginx deployment, nginx serves the SPA directly and proxies `/api/*` and `/public/storage/*` to the backend container.

## Key Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `vite.config.js` | Build and dev server configuration |
| `index.html` | HTML entrypoint |
| `eslint.config.js` | ESLint flat config |
| `public/` | Static assets (favicons, manifest) |
| `src/css/index.css` | Tailwind entry and base styles |
