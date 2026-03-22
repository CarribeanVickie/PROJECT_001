# Database Backup & Restore

For local SQLite:
- Copy `dev.db` to a safe location.
- Restore by replacing the file.

For production (Postgres/MySQL):
- Use native dump tools (`pg_dump`, `mysqldump`).
- Automate backups with scheduled jobs.
