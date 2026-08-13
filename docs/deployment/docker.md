# Docker Deployment

The Docker deployment has two explicit modes. Both use nginx as the public
edge, serve the built React application from the frontend container, and keep
the Express backend private on the Compose network.

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
| `frontend` | `localhost:8000` | nginx, React SPA, API/storage proxy |
| `backend` | Compose network only | Express API, sessions, uploads |
| `postgres` | Compose network only | PostgreSQL database |

PostgreSQL data is stored in the `postgres_data` Docker volume. Uploaded files
are stored in the repository's `public/storage/` directory and mounted at
`/backend/public/storage` inside the backend container.

## Production-Like Deployment

Production uses the same service topology but enables TLS:

```bash
docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml up --build
```

The production stack publishes `80` and `443`, redirects HTTP to HTTPS, and
expects these files before the frontend container starts:

```text
${NGINX_CERT_DIR}/fullchain.pem
${NGINX_CERT_DIR}/privkey.pem
```

`NGINX_CERT_DIR` defaults to `./docker/nginx/certs`. It can point to a host
directory such as `/etc/letsencrypt/live/crater.example.com`. The certificate
files are mounted read-only into nginx and must never be committed or copied
into a Docker image.

Set `POSTGRES_PASSWORD` for a deployed environment. The Compose defaults are
intended only for local development. Review `backend/.env.example` and provide
the production database, session, API-key, and storage settings appropriate to
the deployment. PostgreSQL stores the initial password in its persistent data
volume; changing `POSTGRES_PASSWORD` later does not change an existing database
user password. Change the database password in PostgreSQL or provision a new
volume as part of a controlled migration.

## Let's Encrypt Certificates

Let's Encrypt requires a real public DNS name. It cannot issue a certificate
for `localhost`, a private Docker hostname, or a typical private IP address.
The development stack therefore stays HTTP-only.

### Initial certificate with standalone HTTP-01

Point the domain's A/AAAA record at the deployment host and ensure port 80 is
reachable. Install Certbot on the host, then obtain the first certificate while
the nginx container is stopped so Certbot can bind port 80:

```bash
docker compose -f docker-compose.prod.yml stop frontend
sudo certbot certonly --standalone -d crater.example.com
```

Start the production stack using the certificate directory:

```bash
export NGINX_CERT_DIR=/etc/letsencrypt/live/crater.example.com
```

If the host's Certbot layout uses symlinks under `live/`, verify that Docker
can read the linked files and restart nginx after renewal.

### Webroot HTTP-01 renewal

The production nginx configuration serves
`/.well-known/acme-challenge/` from the shared `NGINX_ACME_DIR` directory.
For an existing certificate managed with Certbot webroot, use:

```bash
sudo certbot certonly --webroot \
  -w /path/to/crater-spotter/docker/nginx/acme \
  -d crater.example.com
```

The HTTP challenge must be reachable at
`http://crater.example.com/.well-known/acme-challenge/...`. After a successful
renewal, restart the frontend container so nginx reads the renewed certificate:

```bash
docker compose -f docker-compose.prod.yml restart frontend
```

Automate `certbot renew` with a systemd timer or cron job and use a deploy hook
to restart the frontend only when a certificate changes:

```bash
sudo certbot renew --deploy-hook \
  'docker compose -f /path/to/crater-spotter/docker-compose.prod.yml restart frontend'
```

### DNS-01 alternative

Use DNS-01 when port 80 cannot be exposed or when issuing a wildcard
certificate. Install the Certbot plugin for the DNS provider and create the
required TXT record through that provider. The exact command depends on the
provider; do not place its API token in git or in a Docker image.

## Operational Checks

Validate configuration before starting either stack:

```bash
docker compose config
docker compose -f docker-compose.prod.yml config
```

Useful checks after startup:

```bash
curl -fsS http://localhost:8000/api/v1/config
curl -I http://crater.example.com
curl -fsS https://crater.example.com/api/v1/config
```

The backend health endpoint is `/healthz` inside the Compose network. It is
not published to the host. If the frontend does not start, inspect `docker
compose logs backend frontend postgres` and confirm PostgreSQL is healthy,
certificate files exist, and `public/storage/` is writable by the backend
container.

Never expose port 8000 directly in production. Nginx should be the only public
application entry point.

The production stack publishes host ports 80 and 443. If either port is already
occupied by another web server, stop that service or place this stack behind
that existing edge proxy and remove the conflicting host binding.
