# Database Performance

Performance considerations:

- Add indexes on commonly queried columns (teamId, assigneeId, dueAt)
- Use pagination for task lists (limit/offset or cursor-based)
- Cache expensive queries if needed (Redis)
