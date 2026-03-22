# Database Migrations

Use Prisma Migrate or equivalent to manage schema changes.

Workflow:
1. Update `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <description>`.
3. Commit the generated migration files.

For production, use `npx prisma migrate deploy`.
