# Middleware Error Handling

Implement a centralized error handler to catch and format errors consistently.

- Catch synchronous and async errors.
- Return JSON `{ error: string }` with appropriate HTTP status.
- Avoid leaking stack traces in production.
