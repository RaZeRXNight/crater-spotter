# Docker Deployment

The Docker deployment uses one application container. It builds the React
application and serves it from Express alongside the API and uploads.

## Development

Create the backend environment file and set the Google Maps key and session
secret:

```bash
cp backend/.env.example backend/.env
```

Start the default HTTP stack:

```bash
docker compose up --build
```

Open <http://localhost:8000>. No certificate files are required. The stack
contains:

| Service | Host access | Purpose |
|---|---|---|
| `backend` | `localhost:8000` | React SPA, Express API, sessions, uploads |
| `postgres` | Compose network only | PostgreSQL database |

PostgreSQL data is stored in the `postgres_data` Docker volume. Uploaded files
are stored in the repository's `public/storage/` directory and mounted at
`/backend/public/storage` inside the backend container.

## Production-Like Deployment

Production publishes the application directly over HTTP on port `80`:

```bash
docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml up --build
```

TLS termination, HTTPS redirects, certificates, and ACME renewal must be
handled by an external reverse proxy or load balancer.

Set `POSTGRES_PASSWORD` for a deployed environment. The Compose defaults are
intended only for local development. Review `backend/.env.example` and provide
the production database, session, API-key, and storage settings appropriate to
the deployment. PostgreSQL stores the initial password in its persistent data
volume; changing `POSTGRES_PASSWORD` later does not change an existing database
user password. Change the database password in PostgreSQL or provision a new
volume as part of a controlled migration.

## Operational Checks

Validate configuration before starting either stack:

```bash
docker compose config
docker compose -f docker-compose.prod.yml config
```

Useful checks after startup:

```bash
curl -fsS http://localhost:8000/api/v1/config
curl -fsS http://localhost/api/v1/config
```

The backend health endpoint is `/healthz`. If the application does not start,
inspect `docker compose logs backend postgres` and confirm PostgreSQL is
healthy and `public/storage/` is writable by the backend container.
