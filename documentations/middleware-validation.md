# Middleware Validation

Use schema validation for all incoming request bodies.

Example:
- Use `zod` schemas for `createTask`, `updateTask`, `createUser`.
- Return `400` on validation errors with details.
