# SQLite to PostgreSQL Migration

The authoritative source is the repository-root `.sqlite3` file. The migration
rebuilds the disposable PostgreSQL target and imports `Users`, `Pins`, and
`Comments` while preserving numeric IDs and password values. `Sessions` is
created empty so all users log in again.

Run the dry run before stopping the backend:

```bash
npm --prefix backend run migrate:data
```

For the final migration:

1. Stop the backend and wait for it to exit.
2. Back up `.sqlite3`, any `.sqlite3-wal`/`.sqlite3-shm` files, and `public/storage/`.
3. Run the migration with `--apply`.
4. Confirm `Migration applied and validated successfully.`
5. Start the backend against the PostgreSQL target.
6. Verify login, pins, comments, images, and one new write.

```bash
docker compose stop backend
npm --prefix backend run migrate:data -- --apply
docker compose up -d backend
```

The command is dry-run by default. `--apply` drops and recreates the domain
tables in the configured disposable target, so never point it at a database
that contains data to preserve. It uses a PostgreSQL advisory lock and validates
row counts, deterministic checksums, foreign-key references, storage files, and
auto-increment sequences before returning success.

If the migration or smoke test fails before new PostgreSQL writes are accepted,
restore the old environment and restart the SQLite-backed backend. Keep the
SQLite backup and old target until the new deployment has been accepted.

The target may be selected with `DATABASE_URL`; otherwise the existing
`DEV_DB_*`/`DB_*` environment selection is used. Set `MIGRATION_SOURCE_PATH` or
pass `--source` to use a different SQLite snapshot.
